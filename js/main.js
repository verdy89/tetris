document.getElementById("hello_text").textContent = "TETRIS";

/* ---------- global variables ---------- */

var moving = true;
var loop;

var point = 0;
var cells;

var blocks = { // ブロックのパターン
	i: {
		class: "i",
		pattern: [
			[0, 0, 0, 0],
			[1, 1, 1, 1]
		]
	},
	o: {
		class: "o",
		pattern: [
			[1, 1],
			[1, 1]
		]
	},
	t: {
		class: "t",
		pattern: [
			[0, 1, 0],
			[1, 1, 1]
		]
	},
	s: {
		class: "s",
		pattern: [
			[0, 1, 1],
			[1, 1, 0]
		]
	},
	z: {
		class: "z",
		pattern: [
			[1, 1, 0],
			[0, 1, 1]
		]
	},
	j: {
		class: "j",
		pattern: [
			[1, 0, 0],
			[1, 1, 1]
		]
	},
	l: {
		class: "l",
		pattern: [
			[0, 0, 1],
			[1, 1, 1]
		]
	},
}

var isFalling = false;
var fallingBlockNum = 0;

//var rotateCnt = 0;

/* ---------- main ---------------------- */ 

/* 初期化 */
loadTable();

/* キーボード入力 */
document.addEventListener("keydown", onKeyDown); // キーボードイベントの監視

function onKeyDown(event) {
	if (event.keyCode === 37 && moving) { // 左矢印キーで左移動
		moveLeft();
	} else if (event.keyCode === 39 && moving) { // 右矢印キーで右移動
		moveRight();
	} else if (event.keyCode === 38 && moving) { // 上矢印キーで回転(未実装)
		rotate();
		rotateCnt++;
	} else if (event.keyCode === 40 && moving) { // 下矢印キーで落とす
		fallTrough();
	} else if (event.keyCode === 80) { // p で Pause/Restart
		if (moving) {
			document.getElementById("point").textContent = "Pause";
			stop();
			moving = false;
		} else {
			mainLoop();
			moving = true;
		}
	}
}
// keyCode の確認は http://keycode.info

/* メインループ */
mainLoop();

function mainLoop(){
	loop = setInterval(function() { // setInterval(function, interval) で interval[ms] ごとに function を繰り返す
		/* タイトルのカウントアップ */
		point++; // 何回目か数えるために変数pointを1ずつ増やす
		document.getElementById("hello_text").textContent = "TETRIS";
		document.getElementById("point").textContent = "Point = " + point; //何回目かを文字にまとめて表示する

		/* ゲーム続行確認 */
		//checkGameOver();

		/* ブロックを落とす */
		if (hasFallingBlock()) {
			fallBlocks();
		} else {
			deleteCompleteRow();
			generateNewBlock();
		}

		//checkBase();
	}, 500);
}

function stop(){
	clearInterval(loop);
}

/* ---------- 関数の宣言 ----------------- */

function loadTable() { // 200個の td をそれぞれのセルに対応させる
	var td_array = document.getElementsByTagName("td"); //200個の要素を持つ配列
	cells = [];
	var index = 0;
	for (var row = 0; row < 20; row++) { // ページに記載されているコードの &lt; は < の間違い
		cells[row] = []; // 配列のそれぞれの要素を配列にする(2次元配列にする)
		for (var col = 0; col < 10; col++) {
			cells[row][col] = td_array[index];
			index++;
		}
	}	
}

function checkGameOver() {
	for (var row = 0; row < 2; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].className !== "" && cells[row][col].blockNum !== fallingBlockNum) {
				alert("GAME OVER!\nRestart: Press F5")
				clearInterval(loop); // alert が出た後もカウントし続けると、無限に alert されてうざいので止める
				// こうしても２つ alert が出ることがあって謎
			}
		}
	}
}

function hasFallingBlock() { // 落下中のブロックがあるか確認する
	return isFalling;
}

function fallBlocks() { // ブロックを落とす
	/*// 一番下の行のクラスを空にする
	for (var i = 0; i < 10; i++) {
		cells[19][i].className = "";
	}*/

	// 1. 底についていないか？
	for (var col = 0; col < 10; col++) {
		if (cells[19][col].blockNum === fallingBlockNum) {
			isFalling = false;
			return;
		}
	}

	// 2. 1マス下に別のブロックがないか？
	for (var row = 18; row >= 0; row--) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row+1][col].className !== "" && cells[row+1][col].blockNum !== fallingBlockNum) {
					isFalling = false;
					return;
				}
			}
		}
	}

	// 下から2番目の行から繰り返しクラスを下げていく
	for (var row = 18; row >= 0; row--) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				//cells[row+1][col].textContent = "b";
				//cells[row][col].textContent = "";
				cells[row+1][col].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				cells[row+1][col].className = cells[row][col].className;
				cells[row+1][col].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function deleteCompleteRow() { // そろった行を消す
	var cntDeleteLine = 0;
	var row = 19;
	while(row >= 0) {
		var canDelete = true;
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].className === "") {
				canDelete = false;
			}
		}
		if (canDelete) {
			// 1行消す
			for (var col = 0; col < 10; col++) {
				cells[row][col].className = "";
			}
			// 上の行のブロックをすべて1マス落とす
			for (var downRow = row-1; downRow >= 0; downRow--) {
				for (var col = 0; col < 10; col++) {
					cells[downRow+1][col].className = cells[downRow][col].className;
					cells[downRow+1][col].blockNum = cells[downRow][col].blockNum;
					cells[downRow][col].className = "";
					cells[downRow][col].blockNum = null;
				}
			}
			//
			cntDeleteLine++;
		} else {
			row--;
		}
	}
	if (cntDeleteLine === 4) { // 消した行数の表示
		document.getElementById("information").textContent = "TETRIS";
		point += 1000;
	} else if (cntDeleteLine >= 2){
		document.getElementById("information").textContent = cntDeleteLine + " lines were deleted!";
		point += cntDeleteLine * 100;
	} else if (cntDeleteLine) {
		document.getElementById("information").textContent = cntDeleteLine + " line was deleted!";
		point += cntDeleteLine * 100;
	} else {
		document.getElementById("information").innerHTML = "<br>";
	}
}

function generateNewBlock() { // ランダムにブロックを生成する
	// 0. 前のブロックの基点を削除する
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				cells[row][col].base = null;
			}
		}
	}

	// 1. ブロックパターンからランダムに一つパターンを選ぶ
	var keys = Object.keys(blocks);
	var nextBlockKey = keys[Math.floor(Math.random() * keys.length)];
	var nextBlock = blocks[nextBlockKey];
	var nextFallingBlockNum = fallingBlockNum + 1;

	// 2. 選んだパターンをもとにブロックを配置する
	var pattern = nextBlock.pattern;
	//cells[0][3].textContent = "b"; // 回転の基点
	cells[0][3].base = true; // 回転の基点
	for (var row = 0; row < pattern.length; row++) {
		for (var col = 0; col < pattern[row].length; col++) {
			if (pattern[row][col]) {
				cells[row][col+3].className = nextBlock.class; // 配置する位置は4マス目から
				cells[row][col+3].blockNum = nextFallingBlockNum; // わからない
			}
		}
	}

	// 3. 落下中のブロックがあるとする
	isFalling = true;
	fallingBlockNum = nextFallingBlockNum;
	rotateCnt = 0;
}

function moveRight() { // ブロックを右に移動させる
	for (var row = 0; row < 20; row++) {
		if (cells[row][9].blockNum === fallingBlockNum) { // ブロックが右端に来ている
			//document.getElementById("hello_text").textContent = "はじめてのJavaScript***";
			return;
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 8; col >= 0; col--) {
			if (cells[row][col].blockNum === fallingBlockNum && cells[row][col+1].className !== "" && cells[row][col+1].blockNum !== fallingBlockNum) { // 右に別のブロックが存在する
				//document.getElementById("hello_text").textContent = "はじめてのJavaScript*****";
				return;
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 8; col >= 0; col--) {
			if (cells[row][col].base) {
				//cells[row][col+1].textContent = "b";
				//cells[row][col].textContent = null;
				cells[row][col+1].base = true;
				cells[row][col].base = null;
			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				//document.getElementById("hello_text").textContent = "はじめてのJavaScript moveRight";
				cells[row][col+1].className = cells[row][col].className;
				cells[row][col+1].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function moveLeft() { // ブロックを左に移動させる
	for (var row = 0; row < 20; row++) {
		if (cells[row][0].blockNum === fallingBlockNum) { // ブロックが左端に来ている
			//document.getElementById("hello_text").textContent = "はじめてのJavaScript***";
			return;
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 1; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum && cells[row][col-1].className !== "" && cells[row][col-1].blockNum !== fallingBlockNum) { // 左に別のブロックが存在する
				//document.getElementById("hello_text").textContent = "はじめてのJavaScript*****";
				return;
			}
		}
	}
	for (var row = 0; row < 20; row++) {
		for (var col = 1; col < 10; col++) {
			if (cells[row][col].base) {
				//cells[row][col-1].textContent = "b";
				//cells[row][col].textContent = null;
				cells[row][col-1].base = true;
				cells[row][col].base = null;

			}
			if (cells[row][col].blockNum === fallingBlockNum) {
				//document.getElementById("hello_text").textContent = "はじめてのJavaScript moveRight";
				cells[row][col-1].className = cells[row][col].className;
				cells[row][col-1].blockNum = cells[row][col].blockNum;
				cells[row][col].className = "";
				cells[row][col].blockNum = null;
			}
		}
	}
}

function rotate() { // ブロックを回転させる
	// 1. ブロックの回転に関係する範囲を決める (blockRange ** 2 の範囲)
	var blockRange = 0;
	var initRow, initCol;
	var blockClass;
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].blockNum === fallingBlockNum) {
				if (cells[row][col].className === "o") {
					return; // 四角は回転できない
				} else if (cells[row][col].className === "i") {
					blockRange = 4;
				} else {
					blockRange = 3;
				}
				blockClass = cells[row][col].className
				break;
			}
		}
	}
	// 2. 起点となるセルに移動する
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				initRow = row;
				initCol = col;
				break;
			}
		}
	}

	// 3. 範囲内に別のブロックが存在しないか確認する
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			if (cells[initRow+i][initCol+j].className !== "" && cells[initRow+i][initCol+j].blockNum !== fallingBlockNum) {
				return; // 回転不可
			}
		}
	}

	// 4. ブロックを回転させる
	var rotetedBlockClass;
	if (blockRange === 3) {
		rotetedBlockClass = [["","",""],["","",""],["","",""]]
	} else if (blockRange === 4) {
		rotetedBlockClass = [["","","",""],["","","",""],["","","",""],["","","",""]]
	}
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			rotetedBlockClass[j][blockRange-1-i] = cells[initRow+i][initCol+j].className;
		}
	}
	for (var i = 0; i < blockRange; i++) {
		for (var j = 0; j < blockRange; j++) {
			cells[initRow+i][initCol+j].blockNum = null;
			cells[initRow+i][initCol+j].className = rotetedBlockClass[i][j];
			//cells[initRow+i][initCol+j].textContent = "c"
			if (rotetedBlockClass[i][j] !== "") {
				cells[initRow+i][initCol+j].blockNum = fallingBlockNum;
			}
		}
	}	
}

function fallTrough() { // 落ちるところまで落とす
	while(isFalling) {
		fallBlocks();
	}
}

function checkBase() {
	for (var row = 0; row < 20; row++) {
		for (var col = 0; col < 10; col++) {
			if (cells[row][col].base) {
				cells[row][col].className = "base";
			}
		}
	}
}