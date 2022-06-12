// 기본 초기화
var check_ready_data = false;
var tetris_canvas;
var ctx;

var game_status = 1; // 1=게임중, 2=게임오버
const PLAY = 1;
const GAMEOVER = 2;
var run_interval_flag; //play Interval 호출 on off

var main_boxsize = 25;
var main_box_top = 70;
var main_box_left = 150;
var next_box_top = 5;
var next_box_left= 5;

var next_blockbox; // 미리보기 블록박스
var main_blockbox; // 메인박스
var block_item_queue = new Array(); // 미리보기 블록박스 큐 (javascript 배열)
block_item_queue.unshift(Math.floor(Math.random()*4.9)); // 큐 초기화
console.log("first item unmber: " + block_item_queue[0]);
var score;

var main_block; // 5가지 타입 블록
var block_color_number; // 내려오는 블록 색상
var next_block_color_number; // 미리보기 블록 색상
var next_block_number_g; // 회전 에러방지용 블록넘버
var next_block_number_gr;
var main_block_color; // 보드에 남아있는 블록 색상
var main_block_this; // 현재 사용중인 블록

// 미리보기 블럭박스 초기화
function next_blockbox_init() {
	next_blockbox = new Array();
	for(i = 0; i<4; ++i) {
		next_blockbox.push(new Array(10));
		// 모두 0으로 채운다
		for(j=0; j<4; ++j) { next_blockbox[i][j]=0; }
	}
}

// 메인박스 초기화
function main_blockbox_init() {
	main_blockbox = new Array(); // 20행 10열 메인박스 생성
	for(i = 0; i<20; ++i)	{
		main_blockbox.push(new Array(10));
		for(j = 0; j<10; ++j) { main_blockbox[i][j]=0; } // 각셀 0으로 초기화
	}
}

// 5가지 블럭 초기화
function tetrix_block_init() {
	main_block = new Array();

	// 첫번째 블럭: 일자
	item = new Array();
	item.push(0,0); item.push(0,1); item.push(0,2); item.push(0,3); item.push('color', 'cyan');
	main_block.push(item);

	// 두번째 블럭: ㅜ
	item = new Array();
	item.push(0,0); item.push(0,1); item.push(0,2); item.push(1,1); item.push('color', 'blue');
	main_block.push(item);

	// 세번째 블럭: ㄹ
	item = new Array();
	item.push(0,0); item.push(0,1); item.push(1,1); item.push(1,2); item.push('color', 'orange');
	main_block.push(item);

	// 네번째 블럭: ㄹ 반대
	item = new Array();
	item.push(0,1); item.push(0,2); item.push(1,0); item.push(1,1); item.push('color', 'yellow');
	main_block.push(item);

	// 다섯번째 블럭: ㅁ
	item = new Array();
	item.push(0,0); item.push(0,1); item.push(1,0); item.push(1,1); item.push('color', 'green');
	main_block.push(item);
}

// 현재 움직이는 블록 번호, 좌표
var main_block_number = 1;
var main_block_x = 3;
var main_block_y = 0;

// 배열(메인박스) 초기화
function initialize() {
	if(check_ready_data==false)	{
		tetris_canvas = document.getElementById("canvas");
		ctx = tetris_canvas.getContext("2d");
		tetrix_block_init();	// 블럭모양 초기화
		main_blockbox_init();	// 블럭상자 초기화
		next_blockbox_init(); // 미리보기 블록박스 초기화
		main_block_number = getNextBlock();
		console.log("main_block_number: " + main_block_number);
		next_tetrix_block_number = getNextBlock();
		console.log("next_tetrix_block_number: " + next_tetrix_block_number);
		main_block_this = main_block[main_block_number].slice();        // 메인블록 사본복사
		next_block_this = main_block[next_tetrix_block_number].slice(); // 다음블록 사본복사
		score = 0;
		check_ready_data = true;
    block_color_number = main_block_number;
		next_block_color_number = next_tetrix_block_number;
    switch(block_color_number) {
      case 0:
        block_color="cyan";
        break;
      case 1:
        block_color="blue";
        break;
      case 2:
        block_color="orange";
        break;
      case 3:
        block_color="yellow";
        break;
      case 4:
        block_color="green";
        break;
    }

		// 미리보기 큐 초기화
		main_block_number = Math.floor(Math.random()*4.9);
		block_item_queue.unshift(main_block_number);
	}
}

//박스번호 랜덤함수
function getNextBlock() {
	next_block_number_g = block_item_queue.pop();

	next_random_number = Math.floor(Math.random()*4.9);

	block_item_queue = new Array();
	block_item_queue.unshift(next_random_number);
	return next_block_number_g;
}
function getNextBlockForRun() {
	next_block_number_gr = block_item_queue[0];
	return next_block_number_gr;
}

//충돌판단함수
function checkConflict() {
	var size = main_block_this.length;
  for(k = 0;k<8;k+=2)	{
		check_y = main_block_y + main_block_this[k];
		check_x = main_block_x + main_block_this[k+1];
		if(check_y < 0 )continue;	// y가 0보다 적은 블록은 충돌판단을 안함
		if(check_x < 0 || check_x >=10 || check_y >= 20 || main_blockbox[check_y][check_x]!=0)return true; // 충돌하는 경우
	}
	return false;
}

function play() {
	// 시작시 이미 충돌상태면 게임끝.
	if(checkConflict())
		game_status = GAMEOVER;

	// 블록을 한칸씩 아래로 움직이기
  main_block_y++;

	// 충돌시
  if(checkConflict()) {
    main_block_y--; // 위로 복원
    for(k = 0;k<8;k+=2) { // 8: 블록 순회횟수 하드코딩
      check_y = main_block_y + main_block_this[k];
      check_x = main_block_x + main_block_this[k+1];
			main_blockbox[check_y][check_x]=block_color_number+1;
    }

		// 완성줄 삭제 및 복사
    for(i = 0;i<20;++i) { // 20: 블록박스 순회횟수 하드코딩
      sum = 0;
      for(j = 0;j<10;++j) {
        if(main_blockbox[i][j]!=0)
          sum++;
			}
      if(sum==10) {
        for(k = i;k>0;--k)
          for(j = 0;j<10;++j)
            main_blockbox[k][j]=main_blockbox[k-1][j];
        score+=10;
      }
    }

		// 재시작 블록위치 초기화
    main_block_y = 0;
    main_block_x = 3;
		main_block_number = getNextBlock();
		// 블록번호에 따라 색상 정해주기 (여기서는 블록넘버 전달)
    main_block_this = main_block[main_block_number].slice();
    block_color_number = main_block_number;
    console.log('현재블록: ' + main_block_number);

		next_tetrix_block_number = getNextBlockForRun();
		next_block_color_number = next_tetrix_block_number;
		next_block_this = main_block[next_tetrix_block_number].slice(); //미리보기 블록
		console.log('다음블록: ' + next_tetrix_block_number);
		console.log('--main_block_number: ' + main_block_number);
  }

	onDraw();
}

function rotatItme() {
	console.log("rotatItme / main_block_number: " + main_block_number);
	switch(main_block_number)	{
		case 0: case 1: case 2: case 3: case 5: case 6:
			centerY = 0; centerX = 1;	// ( 0, 1 ) 지점을 중심
			break;
		case 4:
			return;
	}
	// 회전 (인터넷 참고: 행렬 뒤집기, 선형대수)
	// x : -y
	// y : x
	// 이전 상태 기억
	state_block_save = main_block_this.slice();
  for(i = 0;i<8;i+=2)	{
		y = main_block_this[i+1] - centerX;
		x=-(main_block_this[i] - centerY);
		main_block_this[i]=y + centerY;
		main_block_this[i+1]=x + centerX;
	}
	// 충돌하면 원상복귀
	if(checkConflict()) main_block_this = state_block_save.slice();
}

// 마우스 컨트롤
function move_left() {
  main_block_x--;
  if(checkConflict()) main_block_x++;
  else onDraw();
}
function move_right() {
  main_block_x++;
  if(checkConflict()) main_block_x--;
  else onDraw();
}
function move_down() {
  main_block_y++;
  if(checkConflict()) main_block_y--;
  else onDraw();
}
function move_bottom() {
  while(!checkConflict()) main_block_y++;
  if(checkConflict()) main_block_y--;
  else onDraw();
}
function rotate() {
  rotatItme();
  onDraw();
}

// 키보드 컨트롤
function onKeyDown(event)
{
	if(event.which==37)	{ // 왼쪽
    main_block_x--;
    if(checkConflict()) main_block_x++;
    else onDraw();
  }
  if(event.which==39)	{ // 오른쪽
    main_block_x++;
    if(checkConflict()) main_block_x--;
    else onDraw();
  }
  if(event.which==40 || event.which==32) { // 아래, 스페이스바
    main_block_y++;
    if(checkConflict()) main_block_y--;
    else onDraw();
  }
  if(event.which==38)	{ // 위쪽키(회전)
    rotatItme();
    onDraw();
  }
}

//미리보기 그리기
function nextDraw() {
	if(check_ready_data==false) return;
	for(i = 0;i<4; ++i) {
		for(j = 0;j<4; ++j) {
			next_item = next_blockbox[i][j];
			switch(next_item)	{
			case 0:
				main_block_color="#ccc";
				break;
			case 1:
				main_block_color="cyan";
				break;
			case 2:
				main_block_color="blue";
				break;
			case 3:
				main_block_color="orange";
				break;
			case 4:
				main_block_color="yellow";
				break;
			case 5:
				main_block_color="green";
				break;
			}

			if(next_item==0) ctx.fillStyle = main_block_color;
			else ctx.fillStyle = main_block_color; //쌓여있는 블록 색상 검출

			//미리보기 다음 블록 그리기
      switch(next_block_color_number) { //next item 컬러
        case 0:
          block_color="cyan";
          break;
        case 1:
          block_color="blue";
          break;
        case 2:
          block_color="orange";
          break;
        case 3:
          block_color="yellow";
          break;
        case 4:
          block_color="green";
          break;
      }
			for(k = 0;k<8;k+=2) {
				if(next_block_this[k]==i && next_block_this[k+1]==j) ctx.fillStyle = block_color;
			}
			x = next_box_left + j*main_boxsize;
			y = next_box_top + i*main_boxsize;
			ctx.fillRect(x, y, main_boxsize-2, main_boxsize-2);
		}
	}
}

// 메인블록 그리기
function onDraw() {
	if(check_ready_data==false) return;

	// 전체 테두리
	ctx.strokeStyle="#000";
	ctx.lineWidth = 1;
	ctx.fillStyle="#fcfcfc";
	ctx.fillRect(1, 1, tetris_canvas.width-2, tetris_canvas.height-2);

	// 블럭표시(메인보드)
	for(i=0;i<20;++i) {
		for(j=0;j<10;++j) {
			box_item = main_blockbox[i][j];
			// 메인보드에 남아 있는 블록의 컬러 결정
			switch(box_item) {
			case 0:
				main_block_color="#ccc";
				break;
			case 1:
				main_block_color="cyan";
				break;
			case 2:
				main_block_color="blue";
				break;
			case 3:
				main_block_color="orange";
				break;
			case 4:
				main_block_color="yellow";
				break;
			case 5:
				main_block_color="green";
				break;
			}
			if(box_item==0)	ctx.fillStyle = main_block_color;
			else ctx.fillStyle = main_block_color; //쌓여있는 블록 색상 검출

			// 움직이는 블록의 컬러 결정
      switch(block_color_number) {
        case 0:
          block_color="cyan";
          break;
        case 1:
          block_color="blue";
          break;
        case 2:
          block_color="orange";
          break;
        case 3:
          block_color="yellow";
          break;
        case 4:
          block_color="green";
          break;
      }
      for(k=0; k<8; k+=2)	{
				if(main_block_y+main_block_this[k]==i && main_block_x+main_block_this[k+1]==j) {
          ctx.fillStyle = block_color;
        }
			}

			// 움직이는 블록 그리기
			x = main_box_left + j*main_boxsize;
			y = main_box_top + i*main_boxsize;
			ctx.fillRect(x, y, main_boxsize-2, main_boxsize-2);
		}
	}
	// 미리보기 블럭 표시(미리보기)
	nextDraw();

  // 점수표시
  ctx.font = "30px 나눔고딕";
  ctx.fillStyle="black";
  ctx.fillText("Score " + score, 400, 35);

	if(game_status==GAMEOVER)	{
		ctx.fillStyle = "red";
		ctx.fillText("GAME OVER", main_box_left + 40, main_box_top + 250);
		clearInterval(run_interval_flag);
	}
}
