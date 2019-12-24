/*
    Dobby Google API Wrapper

    This is a wrapper for Google API created and used in Dobby Co., Ltd.
    All the documents need to be published as web in public.

    Written by Juan Lee (juanlee@kaist.ac.kr)
    version: dobby.dev.0.1
*/

$("#btn-refresh").click(function(){
  localStorage.clear();
  location.reload();
});

/**************************************************/
// Sheet

async function readSheet(sheetId){
  let sheet = 1;
  sheets = {};

  try {
    // retrieve all sheets until not exist
    while (true) {
      const url = `https://spreadsheets.google.com/feeds/list/${sheetId}/${sheet}/public/values?alt=json`;
      const data = await $.getJSON(url, function(data){
        return data;
      });

      sheets[data.feed.title.$t] = data.feed.entry.map(function(entry){
        const colnames = Object.keys(entry)
          .filter(function(col){return col.startsWith("gsx")})
          .map(function(col){return col.slice(4)});

        let parsed = {};
        colnames.forEach(function(col){
          parsed[col] = entry["gsx$" + col].$t;
        });
        return parsed;
      });

      sheet += 1;
    }
  } catch (error) {}

  return sheets;
};


/**************************************************/
// Time

function remainingTime() {
  let end = new Date();
  end.setHours(24,0,0,0);
  var now = new Date().getTime();
  var distance = end - now;

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

function remainingDate() {
  let tmp_info = new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" });
  let tmp_date = new Date(tmp_info);
  tmp_date.setDate(1);
  tmp_date.setMonth(tmp_date.getMonth() + 1);
  tmp_date.setDate(0);

  const last_date = tmp_date.getDate();
  const today_date = new Date(tmp_info).getDate();
  
  return last_date - today_date;
};

function getDate(){
  let tmp_main = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Seoul"
  });
  let date_main = new Date(tmp_main).getDate();
  return date_main;
};

function todayPoint(initial, delta) {
  let date = getDate();
  return (initial + delta * (date - 1)).toLocaleString();
};

function tomorrowPoint(initial, delta){
  var date = getDate();
  var remaining = remainingDate();

  if (remaining === 0) {
    return initial.toLocaleString();
  }
  return (initial + delta * date).toLocaleString();
};

/**************************************************/
// Updates
function numberWithCommas(x) {
  x = Math.round(x);
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
// updateTime
function updateTime(){
  // update time
  $("#elapsed-date").text(remainingDate());
  $("#elapsed-time").text(remainingTime());

  setTimeout(updateTime, 1000);
};

// load
function load(){
  // update main paint and paints
  readSheet("14RmJK2UOKFodgvEdEKwFCem8jshtdEuUskXQZdlsIsg").then(function(sheets){
    console.log(sheets);

    $("#paints").html("");

    let main = sheets.Paints[0];
    let info = sheets.Info[0];
    
    todaySum =0;
    for(i=0;i<sheets.Paints.length;i++){
      todaySum+=parseInt(todayPoint(sheets.Paints[i]["초기값"],sheets.Paints[i]["변화값"]));
      
    }
    console.log(todaySum);
    tomorrowSum = 0;
    for(i=0;i<sheets.Paints.length;i++){
      tomorrowSum+=parseInt(tomorrowPoint(sheets.Paints[i]["초기값"],sheets.Paints[i]["변화값"]));
    }
    console.log(tomorrowSum);

    $("#main-paint").html(`<h1>${main["제목"]}</h1>
    <div class="row">
        <div class="col"><div class="secondborder2 scale-on-hover"><img src="${
          main["그림url"]
        }" style="max-width: 100%;"></div></div>
    </div>
    <div class="row" style="padding-left: 0%;padding-right: 0%;margin-top: 2em;">
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <h3 style="color: blue;">${info["오늘점수"]}</h3>
            <h4><i class="fa fa-circle" style="color: blue;"></i>&nbsp;${numberWithCommas(todayPoint(
              main["초기값"],
              main["변화값"]
            ))}</h4>
        </div>
        <div class="col-12 col-sm-12 col-md-6 col-lg-6 tomorrow-point">
            <h3 style="color: red;">${info["내일점수"]}</h3>
            <h4><i class="fa fa-arrow-up" style="color: red;"></i>&nbsp;${numberWithCommas(tomorrowPoint(
              main["초기값"],
              main["변화값"]
            ))}</h4>
        </div>
    </div>
    <div class="row" style="padding-left: 0%;padding-right: 0%;margin-top: 2em;">
        <div class="col-12 col-sm-12 col-md-6 col-lg-6">
            <h3 style="color: blue;">${"오늘 점수 총합"}</h3>
            <h4><i class="fa fa-circle" style="color: blue;"></i>&nbsp;${todaySum.toLocaleString()}</h4>
        </div>
        <div class="col-12 col-sm-12 col-md-6 col-lg-6 tomorrow-point">
            <h3 style="color: red;">${"내일 점수 총합"}</h3>
            <h4><i class="fa fa-arrow-up" style="color: red;"></i>&nbsp;${tomorrowSum.toLocaleString()}</h4>
        </div>
    </div>
    <p style="margin-top: 1em;">Contact us: ${info["콘텍트"]}</p>
    <div class="row">
        <div class="col">
            <p style="width: 100%;max-width: 80%;text-align: justify;color: black;margin-top: 1em;">${
              info["텍스트"]
            }</p>
        </div>
    </div>`);

    sheets.Paints.forEach(function(paint, index){
      if (index === 0) return;

      const title = paint["제목"];
      const url = paint["그림url"];
      const initial = paint["초기값"];
      const delta = paint["변화값"];
      var point = todayPoint(initial,delta);
      var tmrwpoint = tomorrowPoint(initial,delta);

      

      const paint_html = `<div class="col-md-6 col-lg-3" id="card-${index}">
          <div class="card border-0"><div class="fourthborder"><div class="thirdborder"><div class="secondborder scale-on-hover"><img class="card-img-top w-100 d-block card-img-top " id="paint-${index}" src="${url}" alt="Card Image" style="cursor: pointer;"></div></div></div>
              <div class="card-body">
                  <h5>${title}</h5>
                  <div class="row">
                      <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                          <h6><i class="fa fa-circle" style="color: blue;"></i>&nbsp;${numberWithCommas(point)}</h6>
                      </div>
                      <div class="col-12 col-sm-12 col-md-12 col-lg-6">
                          <h6><i class="fa fa-arrow-up" style="color: red;"></i>&nbsp;${numberWithCommas(tmrwpoint  )}</h6>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      <div id="footer" class="navbar navbar-dark navbar-expand-lg bg-white portfolio-navbar gradient" style="background: linear-gradient(120deg,#080808,#444);">
        <div style="padding-left:20%;">Today's total : ${todaySum.toLocaleString()}</div>
        <div style="padding-left:30%;">Tomorrow's total : ${tomorrowSum.toLocaleString()}</div>
      </div>`;


      $("#paints").append(paint_html);

      $(`#paint-${index}`).addClass("col-md-12");

      $(`#paint-${index}`).bind("click", function(){
        var modalImg = document.getElementById("img01");
        var captionText = document.getElementById("caption");
        var modal = document.getElementById("myModal");
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = title;

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        modal.addEventListener("click", function(){
          modal.style.display = "none";
        })

      })

// Get the image and insert it inside the modal - use its "alt" text as a caption

      // $(`#paint-${index}`).click($(`#card-${index}`).scrollIntoView(true));
    });
  });
};

/**************************************************/
// Interactions

// addInteraction
let addInteraction = function(index) {return function() {
  $(`#card-${index}`).toggleClass("col-md-6");
  $(`#card-${index}`).toggleClass("col-lg-3");

  $(`#card-${index}`).toggleClass("col-md-12");
  $(`#card-${index}`).toggleClass("col-lg-12");
  $(`#card-${index}`).scrollIntoView(true);
}};

function moveToCenter(index){
  $(`#card-${index}`).scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
  });
  $(`#paint-${index}`).scrollIntoView({
    behavior: 'auto',
    block: 'center',
    inline: 'center'
  });
  // const elementRect = obj.getBoundingClientRect();
  // const absoluteElementTop = elementRect.top + window.pageYOffset;
  // const middle = absoluteElementTop - (window.innerHeight / 2);
  // window.scrollTo(0, middle);
}