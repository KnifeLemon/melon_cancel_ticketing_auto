var iframe = $('#oneStopFrame');
var disableColor = "#DDD";
var refreshTimer, findTimer;

async function sortSeatList() {
    // 좌석 객체
    function getRectsAsync() {
        return new Promise((resolve) => {
            var rects = iframe[0].contentWindow.document.querySelectorAll('#ez_canvas rect');
            var rectsArray = Array.prototype.slice.call(rects);
            resolve(rectsArray);
        });
    }

    // 좌석 정렬 ( Y축 맨위, X축 중앙 )
    function sortRectsAsync(rectsArray) {
        return new Promise((resolve) => {
            rectsArray.sort(function (a, b) {
                var aX = a.getAttribute('x');
                var aY = a.getAttribute('y');
                var bX = b.getAttribute('x');
                var bY = b.getAttribute('y');
                if (aY == bY) {
                    return aX - bX;
                }
                return aY - bY;
            });
            resolve(rectsArray);
        });
    }

    // 정렬된 좌석 HTML에 다시 정렬
    function appendRectsAsync(sortedRects) {
        return new Promise((resolve) => {
            var svg = iframe[0].contentWindow.document.querySelector('#ez_canvas svg');
            sortedRects.forEach(function (rect) {
                svg.appendChild(rect);
            });
            resolve();
        });
    }

    // 좌석 정렬 실행
    var rectsArray = await getRectsAsync();
    var sortedRects = await sortRectsAsync(rectsArray);
    await appendRectsAsync(sortedRects);
}

function simulateClick(ele) {
    let event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window
    });
   
    ele.dispatchEvent(event);
}
function startRefresh() {
    refreshTimer = setInterval(() => {
        if(iframe[0].contentWindow.lastZone == null){
            init();
            $('#gd'+iframe[0].contentWindow.lastGrade).click();
        }else{
            iframe[0].contentWindow.init_suv();
            parent.data.selectedSeatCount = 0;
            iframe[0].contentWindow.setSelectSeatCount(true);
            iframe[0].contentWindow.getBlockSeatList();
        }
    }, 800);
}

function findRect() {
    findTimer = setInterval(() => {
        var rect = $(`#ez_canvas rect:not([fill*='${disableColor}']):not([fill*='none'])`, iframe.contents());
        if (rect.length > 0) {
            simulateClick(rect[0]);
            clearInterval(refreshTimer);
            clearInterval(findTimer);
        }

        if (parent.data.selectedSeatCount > 0) iframe[0].contentWindow.goTicketType();
    }, 10);
}

function start() {
    sortSeatList().then(() => {
        startRefresh();
        findRect();
    });
}

function stop() {
	clearInterval(refreshTimer);
	clearInterval(findTimer);
}

start();
