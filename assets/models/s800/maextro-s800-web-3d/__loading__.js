pc.script.createLoadingScreen(function (app) {
  // The code here is messy, and I don't know the logic here anymore.
  var onUpdateInterval;
  var carHallInterval;
  var Height = document.body.offsetHeight;
  var Width = document.body.offsetWidth;
  var picState = 0; // 1 正常横版 2手机横版 3pc横版 4竖版
  // TODO 开发使用 增加车辆每次更改
  var carNumber = 12; // 车的数量
  var pathName = [
    "50080100157",
    "5008010013301",
    "5008010004501",
    "5008010007101",
    "5008010020201",
    "5008010020301",
    "5008010010601",
    "5008010015901",
    "5008010023501",
    "5008010028001",
    "5008010029801",
    "M6",
    "VR",
  ]; //在‘VR’场景中的多车展厅
  var loadIndex =
    pathName.indexOf(GetQueryString("SN")) !== -1
      ? pathName.indexOf(GetQueryString("SN"))
      : pathName.length - 1;
  window.isDarkScene = GetQueryString("SN") === "M6";
  // 车辆数据
  var loadData = [
    // TODO F1数据
    {
      name: "享界 S9 增程 Ultra",
      list: ["35.98万", "EVR（增程式混动）", "3050mm", "5160 x 2005 x 1492mm"],
      imgTBNumber: 267000865,
      imgTBName: "x4a-tb-load-bg.jpg",
      imgPCNumber: 267000864,
      imgPCName: "x4a-pc-load-bg.jpg",
      imgMOBNumber: 229369977,
      imgMOBName: "x4a-mob-load-bg.jpg",
    },
    // {
    //     name: '享界 S9 增程 Ultra',
    //     list: ["36.98万", "EVR（增程式混动）", "3050mm", "5160 x 2005 x 1486mm"],
    //     imgTBNumber: 223853322,
    //     imgTBName: 's9-tb-load-bg.jpg',
    //     imgPCNumber: 223853323,
    //     imgPCName: 's9-pc-load-bg.jpg',
    //     imgMOBNumber: 223853321,
    //     imgMOBName: 's9-mob-load-bg.jpg',
    // },
    {
      name: "问界 新M5 增程 Ultra 四驱版",
      list: ["24.98万", "EVR（增程式混动）", "2880mm", "4785 x 1930 x 1625mm"],
      imgTBNumber: 215617986,
      imgTBName: "x1c-tb-load-bg.jpg",
      imgPCNumber: 215617985,
      imgPCName: "x1c-pc-load-bg.jpg",
      imgMOBNumber: 215617984,
      imgMOBName: "x1c-mob-load-bg.jpg",
    },
    {
      name: "问界 M9 纯电 Ultra 六座版",
      list: ["57.98万", "EV（纯电动）", "3110mm", "5230 x 1999 x 1800mm"],
      imgTBNumber: 219525467,
      imgTBName: "f2a-tb-load-bg.jpg",
      imgPCNumber: 219525468,
      imgPCName: "f2a-pc-load-bg.jpg",
      imgMOBNumber: 219525466,
      imgMOBName: "f2a-mob-load-bg.jpg",
    },
    {
      name: "问界 M8 增程 UItra 六座版",
      list: ["45.98万", "EVR（增程式混动）", "3105mm", "5190 x 1999 x 1795mm"],
      imgTBNumber: 223469765,
      imgTBName: "m8-tb-load-bg.jpg",
      imgPCNumber: 223481849,
      imgPCName: "m8-pc-load-bg.jpg",
      imgMOBNumber: 223469766,
      imgMOBName: "m8-mob-load-bg.jpg",
    },
    {
      name: "尊界 S800 星耀行政增程版",
      list: ["101.8万", "EVR（增程式混动）", "3370mm", "5480 x 2000 x 1542mm"],
      imgTBNumber: 229369979,
      imgTBName: "x6-tb-load-bg.jpg",
      imgPCNumber: 229369978,
      imgPCName: "x6-pc-load-bg.jpg",
      imgMOBNumber: 229369977,
      imgMOBName: "x6-mob-load-bg.jpg",
    },
    {
      name: "尊界 S800 星耀尊享增程版",
      list: ["78.8万", "EVR（增程式混动）", "3370mm", "5480 x 2000 x 1542mm"],
      imgTBNumber: 229369979,
      imgTBName: "x6-tb-load-bg.jpg",
      imgPCNumber: 229369978,
      imgPCName: "x6-pc-load-bg.jpg",
      imgMOBNumber: 229369977,
      imgMOBName: "x6-mob-load-bg.jpg",
    },
    {
      name: "智界 新S7 Ultra",
      list: ["29.98万", "EV（纯电动）", "2950mm", "4971 x 1963 x 1460mm"],
      imgTBNumber: 244725681,
      imgTBName: "EH3N-tb-load-bg.jpg",
      imgPCNumber: 244725682,
      imgPCName: "EH3N-pc-load-bg.jpg",
      imgMOBNumber: 244725680,
      imgMOBName: "EH3N-mob-load-bg.jpg",
    },
    {
      name: "智界 R7 纯电 Ultra",
      list: ["31.98万", "EV（纯电动）", "2950mm", "4982 x 1981 x 1634mm"],
      imgTBNumber: 244728274,
      imgTBName: "ehyn-tb-load-bg.jpg",
      imgPCNumber: 244728275,
      imgPCName: "ehyn-pc-load-bg.jpg",
      imgMOBNumber: 244728273,
      imgMOBName: "ehyn-mob-load-bg.jpg",
    },
    {
      name: "问界 M7 增程 Ultra 五座版",
      list: ["34.98万", "EVR（增程式混动）", "3030mm", "5080 x 1999 x 1780mm"],
      imgTBNumber: 251178233,
      imgTBName: "f1l-tb-load-bg.jpg",
      imgPCNumber: 251178234,
      imgPCName: "f1l-pc-load-bg.jpg",
      imgMOBNumber: 251178235,
      imgMOBName: "f1l-mob-load-bg.jpg",
    },
    {
      name: "尚界 H5 增程 Max",
      list: ["17.98万", "EVR（增程式混动）", "2840mm", "4780 x 1910 x 1664mm"],
      imgTBNumber: 249129918,
      imgTBName: "sha-tb-load-bg.jpg",
      imgPCNumber: 249129916,
      imgPCName: "sha-pc-load-bg.jpg",
      imgMOBNumber: 249129915,
      imgMOBName: "sha-mob-load-bg.jpg",
    },
    {
      name: "享界 S9T 纯电 Ultra",
      list: ["37.98万", "EV（纯电动）", "3050mm", "5160 × 2005 × 1492mm"],
      imgTBNumber: 252709463,
      imgTBName: "s9t-tb-load-bg.jpg",
      imgPCNumber: 252709460,
      imgPCName: "s9t-pc-load-bg.jpg",
      imgMOBNumber: 252709461,
      imgMOBName: "s9t-mob-load-bg.jpg",
    },
    {
      name: "问界 M6",
      list: ["**万", "EV（纯电动）", "2950mm", "4960 × 1985 × 2950mm"],
      imgTBNumber: 282935399,
      imgTBName: "x1l-tb-load-bg.jpg",
      imgPCNumber: 282935398,
      imgPCName: "x1l-pc-load-bg.jpg",
      imgMOBNumber: 282935397,
      imgMOBName: "x1l-mob-load-bg.jpg",
    },
    // {
    //     name: '享界 S9 增程 Ultra',
    //     list: ["34.98万", "EVR（增程式混动）", "3050mm", "5160 x 2005 x 1492mm"],
    //     imgTBNumber: 267000865,
    //     imgTBName: 'x4a-tb-load-bg.jpg',
    //     imgPCNumber: 267000864,
    //     imgPCName: 'x4a-pc-load-bg.jpg',
    //     imgMOBNumber: 229369977,
    //     imgMOBName: 'x4a-mob-load-bg.jpg',
    // }
  ];
  // 多车数据
  let carHallLoadData = [
    {
      imgMobNumber: 159490436,
      imgMobName: "carhall-mob-bg2.jpg",
      imgPCNumber: 159490438,
      imgPCName: "carhall-pc-bg2.jpg",
      imgMobENumber: 159490437,
      imgMobEName: "carhall-mob-e-bg2.jpg",
    },
  ];

  // 动态加载统计脚本
  let _script = document.createElement("script");
  _script.setAttribute("src", "https://cdn.weshape3d.com/assets/stat.js");
  document.body.appendChild(_script);

  window.isLandscape = true; // true 横屏 false 竖屏
  window.channel = null; // 设备
  window.isRotate = false; // 是否旋转屏幕
  let maxL = Math.max(Width, Height),
    minL = Math.min(Width, Height),
    className = "",
    imgNumber = "",
    imgName = "",
    backgroundName = "",
    loadingTime = 3500;
  var os = (function () {
    var ua = navigator.userAgent,
      isWindowsPhone = /(?:Windows Phone)/.test(ua),
      isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
      isAndroid =
        /(?:Android)/.test(ua) ||
        /(?:HarmonyOS)/.test(ua) ||
        /(?:harmony)/.test(ua) ||
        /(?:Harmony)/.test(ua) ||
        /(?:hmshop)/.test(ua),
      isFireFox = /(?:Firefox)/.test(ua),
      isChrome = /(?:Chrome|CriOS)/.test(ua),
      isTablet =
        /(?:iPad|PlayBook)/.test(ua) ||
        (isAndroid && !/(?:Mobile)/.test(ua)) ||
        (isFireFox && /(?:Tablet)/.test(ua)),
      isPhone = /(?:iPhone)/.test(ua) && !isTablet,
      isPc = !isPhone && !isAndroid && !isSymbian;
    return {
      isTablet: isTablet,
      isPhone: isPhone,
      isAndroid: isAndroid,
      isPc: isPc,
    };
  })();
  // 1024 827
  var showSplash = function () {
    // splash wrapper
    var wrapperBody = document.createElement("div");
    var loading_bg = document.createElement("img");
    wrapperBody.id = "application-splash-wrapper";
    wrapperBody.style.opacity = "0";
    loading_bg.className = "loadbg";
    loading_bg.onload = function () {
      wrapperBody.style.opacity = "1";
    };
    loading_bg.classList.add("loadbg1");
    // m8 提示文字更改
    let hintText =
      "产品详情（外观、内饰、颜色、尺寸等）请以实际销售车型为准；页面展示功能配置并非全系标配，详情请参阅官方产品规格配置信息。";
    if (loadIndex === 3) {
      hintText = `* 页面车型为未搭载侧向高精度固态激光雷达版本示意；${hintText}`;
    } else {
      hintText = `* 页面内容仅供参考，${hintText}`;
    }
    let loadingText = `<div class="loading-txt">
            <div class="progress-txt">正在初始化展厅 <span class="progress-number">0</span>%</div>
            <div class="progress-bar_outer"><div class="progress-bar_inner"></div></div>
            <div class="loading-hint">${hintText}</div>
        </div>`;
    let carText =
      loadIndex !== carNumber
        ? `<div class="car-txt">
            <div class="car-name">${loadData[loadIndex].name}</div>
            <div class="car-message">
                <div class="inl pc-car-message">
                    <div class="car-message-item">
                        <div class="car-content">${loadData[loadIndex].list[0]}${loadData[loadIndex].list[0] === "敬请期待" ? "" : '<span class="inl">起</span>'}</div>
                        <div class="car-title" style="width: 50px;">建议零售价</div>
                    </div>
                    <div class="car-message-item">
                        <div class="car-content">${loadData[loadIndex].list[2]}</div>
                        <div class="car-title" style="width: 25px;">轴距</div>
                    </div>
                    
                </div>
                <div class="inl pc-car-message">
                    <div class="car-message-item mg">
                        <div class="car-content">${loadData[loadIndex].list[1]}</div>
                        <div class="car-title" style="width: 50px;">能源类型</div>
                    </div>
                    <div class="car-message-item mg">
                        <div class="car-content">${loadData[loadIndex].list[3]}</div>
                        <div class="car-title" style="width: 50px;">车身尺寸</div>
                    </div>
                </div>
                <div class="inl pad-car-message">
                    <div class="car-message-item inl">
                        <div class="car-content">${loadData[loadIndex].list[0]}${loadData[loadIndex].list[0] === "敬请期待" ? "" : '<span class="inl">起</span>'}</div>
                        <div class="car-title" style="width: 50px;">建议零售价</div>
                    </div>
                    
                    <div class="car-message-item inl">
                        <div class="car-content">${loadData[loadIndex].list[1]}</div>
                        <div class="car-title" style="width: 50px;">能源类型</div>
                    </div>
                </div>
                <div class="inl pad-car-message">
                    <div class="car-message-item inl">
                        <div class="car-content">${loadData[loadIndex].list[2]}</div>
                        <div class="car-title" style="width: 25px;">轴距</div>
                    </div>
                    <div class="car-message-item inl mg">
                        <div class="car-content">${loadData[loadIndex].list[3]}</div>
                        <div class="car-title" style="width: 50px;">车身尺寸</div>
                    </div>
                </div>
            </div>
        </div>`
        : "";
    document.body.appendChild(wrapperBody);
    wrapperBody.innerHTML = loadingText + carText;
    wrapperBody.appendChild(loading_bg);

    // 被iframe嵌套
    // window.isIframe = self != top;
    sessionStorage.setItem("isMagicWindow", window.isIframe ? "1" : "0");
    if (!window.isIframe) {
      setEmbedding();
    }
    // setEmbedding();
    // 通过宽高判断竖屏
    // setPortrait();
    UIAdapter();
    if (loadIndex === carNumber) {
      wrapperBody.classList.add("car-hall-load");
      return;
    }
  };
  var setLoadingPage = function (loadEL, loadBgEl) {
    window.os = os;
    let Height = document.documentElement.clientHeight,
      Width = document.documentElement.clientWidth;
    let maxL = Width;
    window.isLandscape = true;
    if (window.embedding) {
      // setVK(loadEL, loadBgEl, 4);
      if (Width / Height <= 1) {
        // 竖屏
        setVK(loadEL, loadBgEl, 4);
        window.isLandscape = false;
      } else {
        // 横屏
        setVK(loadEL, loadBgEl, 2);
      }
    } else if (window.channel === "apk") {
      if (Width / Height < 0.7 || Width / Height > 1.6) {
        // 竖屏
        setVK(loadEL, loadBgEl, 2);
      } else {
        setVK(loadEL, loadBgEl, 1);
      }
    } else if ((os.isAndroid || os.isPhone) && !os.isTablet) {
      // 统一手机
      if (Width / Height <= 0.7) {
        // 竖屏
        setVK(loadEL, loadBgEl, 4);
        window.isLandscape = false;
      } else if (Width / Height > 1.6) {
        // 横屏
        setVK(loadEL, loadBgEl, 2);
      } else {
        // 偏平板
        setVK(loadEL, loadBgEl, 1);
      }
    } else if (os.isPc && !os.isTablet) {
      // 统一pc
      if (Width >= 800) {
        // 800 ?
        if (Width / Height <= 0.7) {
          // 竖屏
          setVK(loadEL, loadBgEl, 4);
          window.isLandscape = false;
        } else if (Width / Height > 1.6) {
          // 横屏
          setVK(loadEL, loadBgEl, 3);
        } else {
          // 偏平板
          setVK(loadEL, loadBgEl, 1);
        }
      } else {
        if (Width / Height <= 0.7) {
          // 竖屏
          setVK(loadEL, loadBgEl, 4);
          window.isLandscape = false;
        } else if (Width / Height > 1.6) {
          // 横屏
          setVK(loadEL, loadBgEl, 2);
        } else {
          // 偏平板
          // setVK(loadEL, loadBgEl, 1);
          setVK(loadEL, loadBgEl, 2); // 平板分辨率 使用 横屏样式 因为平板样式有问题 （很小的正方形窗口样式）
        }
      }
    } else {
      setVK(loadEL, loadBgEl, 1);
    }

    if (maxL <= 1024 && maxL > 850) {
      document.querySelector(".max-tb-screen .loading-txt")
        ? (document.querySelector(".max-tb-screen .loading-txt").style.padding =
            "0 108px")
        : "";
      document.querySelector(".max-tb-screen .car-txt")
        ? (document.querySelector(".max-tb-screen .car-txt").style.padding =
            "0 108px")
        : "";
    }
  };
  var setVK = function (loadEL, loadBgEl, state) {
    // 1 正常横版 2手机横版 3pc横版 4竖版
    let classNames = [
      "max-tb-screen",
      "max-lr-screen",
      "max-pc-screen",
      "max-lr-screen",
    ];
    let imgNames = ["imgTB", "imgPC", "imgPC", "imgMOB"];
    let carHallImgName = ["imgPC", "imgMob", "imgPC", "imgMobE"];
    let index = state - 1;
    let imgNumber = "",
      className = "",
      imgSrc = "",
      imgName = "";
    if (picState === state) return;
    picState = state;
    className = classNames[index];
    if (loadIndex !== carNumber) {
      imgNumber = loadData[loadIndex][imgNames[index] + "Number"];
      imgName = loadData[loadIndex][imgNames[index] + "Name"];
      imgSrc = setSrc(imgNumber, imgName);
    } else {
      carHallLoadData.forEach((item, key) => {
        let imgNumber = item[carHallImgName[index] + "Number"],
          imgName = item[carHallImgName[index] + "Name"],
          loadBgEl = document.querySelector(".loadbg" + (key + 1));
        loadBgEl.src = setSrc(imgNumber, imgName);
      });
    }
    loadEL.className = className;
    if (loadIndex !== carNumber) {
      loadBgEl.src = imgSrc;
    }
  };
  function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  }
  // var setPortrait = function () {
  //     var Height = document.body.offsetHeight;
  //     var Width = document.body.offsetWidth;
  //     if (Width < Height) {
  //         sessionStorage.setItem("isMagicWindow", "1")
  //     } else {
  //         sessionStorage.setItem("isMagicWindow", "0")
  //     }
  //     setEmbedding();
  // }
  var setSrc = function (id, name) {
    var src = "";
    if (window["editor"])
      src = "https://playcanvas.com/api/assets/" + id + "/file/" + name;
    else src = "files/assets/" + id + "/1/" + name;

    return src;
  };

  var hideSplash = function () {
    document.body.style.backgroundColor = "rgb(241,243,245)";
    var tex = document.getElementsByClassName("progress-number");
    tex[0].innerHTML = 100;
    var progress = document.getElementsByClassName("progress-bar_inner")[0];
    progress.style.transform = `translateX(0%)`;
    setTimeout(() => {
      if (document.getElementById("application-canvas"))
        document.getElementById("application-canvas").style.opacity = 1;
      clearInterval(onUpdateInterval);
      clearInterval(carHallInterval);
      window.removeEventListener("resize", resize);
      var splash = document.getElementById("application-splash-wrapper");
      if (splash) {
        splash.style.display = "none";
        splash.parentElement.removeChild(splash);
      }
    }, 100);

    window.firstFrameComplete = +new Date();
  };
  var setProgress = function (value) {
    var tex = document.getElementsByClassName("progress-number");
    tex[0].innerHTML = Math.ceil(value * 100);
    var progress = document.getElementsByClassName("progress-bar_inner")[0];
    // progress.style.width = Math.ceil(value * 100) + '%';
    progress.style.transform = `translateX(${Math.ceil(value * 100) - 100}%)`;
  };
  let pad = 24;
  if (maxL > 1024) {
    translate = "transform:scale(" + maxL / 1024 + ");";
  }
  if (maxL <= 1024 && maxL > 850) {
    pad = 108;
  }
  var createCss = function () {
    var css = [
      ".inl {",
      "   display: inline-block;",
      "}",
      "body {",
      "   height: 100%;,",
      "    width: 100%;",
      "    overflow: hidden;",
      "    margin: 0;",
      "    padding: 0;",
      "}",

      "html,body{",
      "   background-color:transparent;",
      "}",
      "#application-splash-wrapper{",
      "	height:100%;",
      "	width:100%;",
      // '   background-image: url(' + setSrc('147116492', 'vm-loading-logo1.png') + ');',
      "   background-size: 40%;",
      "   background-position: center;",
      "   background-repeat: no-repeat;",
      "   position: fixed;",
      "   margin: auto;",
      "   background-color:rgba(0,0,0,0);",
      "   transform-origin: 0% 0%;",
      "   left:414px;",
      "   top: 0;",
      "   z-index:200;",
      "}",
      "img{",
      "   position:relative;",
      "}",
      // '#application-splash-wrapper img::after{',
      // '   position:absolute;',
      // '   top:0;',
      // '   left:0;',
      // '	height:100%;',
      // '	width:100%;',
      // '   background-image: url(' + setSrc('147116492', 'vm-loading-logo1.png') + ');',
      // '    background-size: 40%;',
      // '    background-position: center;',
      // '    background-repeat: no-repeat;',
      // '    background-color:#FFF;',
      // '    content:"";',
      // '}',
      "#application-splash-wrapper.disLoad{",
      "   background-image: none;",
      "}",
      ".loadbg{",
      "   width: 100%;",
      "   height: 100%;",
      "   top: 50%;",
      "   left: 50%;",
      "   object-fit: cover;",
      "   object-position: left;",
      "   transform: translate(-50%,-50%);",
      // '   background-size: 100% 100%;',
      "   position: absolute;",
      "}",
      ".loadbg.active{",
      "   z-index: 2;",
      "}",
      ".loading-txt{",
      "   position: absolute;",
      "   left: 0;",
      "   bottom: -4px;",
      "   z-index: 20;",
      "   width: 100%;",
      "   padding: 0 24px;",
      "   box-sizing: border-box;",
      "   font-size: 0;",
      "   font-family: Harmony-Regular,HarmonyHeiTi-Regular, HarmonyHeiTi;",
      "}",
      ".progress-txt{",
      "   font-weight: 400;",
      "   font-size: 14px;",
      "   color: #fff;",
      "   line-height: 17px;",
      "}",
      ".progress-bar_outer{",
      "   width: 100%;",
      "   height: 4px;",
      "   margin: 10px 0 12px;",
      "   background: rgba(255,255,255,0.102);",
      "   border-radius: 100px;",
      "   overflow: hidden;",
      "}",
      ".progress-bar_inner{",
      "   width: 100%;",
      "   height: 100%;",
      "   background: #fff;",
      "   border-radius: 100px;",
      "   transform: translateX(-100%);",
      "   transition: transform .1s;",
      "}",
      ".loading-hint{",
      "   width: 133%;",
      "   padding-bottom: 16px;",
      "   font-weight: 400;",
      "   font-size: 12px;",
      "   color: rgba(255,255,255,.6);",
      "   line-height: 14.5px;",
      "   transform: translate3d(0%, 1%, 0) scale(.75);",
      "   transform-origin: left top;",
      "}",
      ".car-txt{",
      "   position: absolute;",
      "   right: 28px;",
      "   top: 22.22%;",
      "   font-size: 0;",
      "   z-index: 20;",
      "}",
      ".car-name{",
      "   margin-bottom: 24px;",
      "   font-weight: 500;",
      "   color: #FFFFFF;",
      "   line-height: 24px;",
      "   font-size: 18px;",
      "   font-family: Harmony-Medium,HarmonyHeiTi-Medium, HarmonyHeiTi;",
      "}",
      ".car-message-item{",
      "   margin-bottom: 25px;",
      "   margin-right: 55px;",
      "}",
      ".car-message-item.mg{",
      "   margin-right: 0;",
      "}",
      ".car-content{",
      "   margin-bottom: 2px;",
      "   font-weight: 400;",
      "   color: #FFFFFF;",
      "   line-height: 19px;",
      "   font-size: 14px;",
      "   font-family: Harmony-Regular,HarmonyHeiTi-Regular, HarmonyHeiTi;",
      "}",
      ".car-content span{",
      "   line-height: 13px;",
      "   font-size: 20px;",
      "   font-family: Harmony-Regular,HarmonyHeiTi-Regular, HarmonyHeiTi;",
      "   transform: translate3d(0%, 1%, 0) scale(.5);",
      "   transform-origin: left bottom;",
      "}",
      ".car-title{",
      "   width: 50%;",
      "   white-space: nowrap;",
      "   font-weight: 400;",
      "   color: rgba(255,255,255,.6);",
      "   line-height: 13px;",
      "   font-size: 20px;",
      "   font-family: Harmony-Regular,HarmonyHeiTi-Regular, HarmonyHeiTi;",
      "   transform: translate3d(0%, 1%, 0) scale(.5);",
      "   transform-origin: left center;",
      "}",
      ".pad-car-message{",
      "   display: none;",
      "}",
      // 多车
      ".car-hall-load .loadbg{",
      // '   opacity: 0;',
      //'   transition: opacity 2.5s;',
      "   object-position: center;",
      "}",
      // '.car-hall-load .loadbg.active{',
      // '   opacity: 1;',
      // '}',
      ".max-tb-screen .loadbg{",
      "   object-position: center;",
      "}",
      ".max-tb-screen .car-txt{",
      "   position: absolute;",
      "   right: auto;",
      "   top: auto;",
      "   left: 0;",
      "   bottom: 122px;",
      "   padding: 0 " + pad + "px;",
      "   width: 100%;",
      "   box-sizing: border-box;",
      "}",
      ".max-tb-screen .pad-car-message{",
      "   display: inline-block;",
      "}",
      ".max-tb-screen .pc-car-message{",
      "   display: none;",
      "}",
      ".max-tb-screen .car-message-item{",
      "   margin-bottom: 0;",
      "}",
      ".max-tb-screen .car-content{",
      "   margin-bottom: 4px;",
      "   line-height: 17px;",
      "}",
      ".max-tb-screen .car-title{",
      "   line-height: 12px;",
      "}",
      ".max-tb-screen .loading-txt{",
      "   padding: 0 " + pad + "px;",
      "}",
      ".max-tb-screen .progress-bar_outer{",
      "   margin: 12px 0 10px;",
      "}",
      ".max-pc-screen .car-txt{",
      // '   right: calc((100% - 1200px) / 2);', // 10.57% 203px
      "   right: 8%;",
      "   top: 36.66%;",
      "}",
      ".max-pc-screen .car-message-item{",
      "   margin-right: 46px;",
      "}",
      ".max-pc-screen .car-name{",
      "   font-size: 32px;",
      "   line-height: 43px;",
      "}",
      ".max-pc-screen .car-content{",
      "   margin-bottom: 4px;",
      "   font-size: 16px;",
      "   line-height: 21px;",
      "}",
      ".max-pc-screen .car-content span{",
      "   transform: none;",
      "   font-size: 14px;",
      "   line-height: 21px;",
      "}",
      ".max-pc-screen .car-title{",
      "   width: auto!important;",
      "   font-size: 14px;",
      "   line-height: 19px;",
      "   transform: none;",
      "}",
      ".max-pc-screen .loading-txt{",
      "   padding: 0 0;",
      "   left: 50%;",
      "   transform: translateX(-50%);",
      "   width: 1200px;",
      "   max-width: 90%;",
      "   margin: 0 auto;",
      "}",
      ".max-pc-screen .progress-txt{",
      "   font-size: 16px;",
      "}",
      ".max-pc-screen .progress-bar_outer{",
      "   margin: 10px 0;",
      "}",
      ".max-pc-screen .loading-hint{",
      "   width: 100%;",
      "   line-height: 16px;",
      "   padding-bottom: 49px;",
      "   font-size: 12px;",
      "   transform: none;",
      "}",
      // 平行视界
      ".embedding-container #application-splash-wrapper{",
      "   width: 100%!important;",
      "   height: 100%!important;",
      "   transform: none!important;",
      "   left: 0!important;",
      "}",
      ".embedding-container .loading-txt{",
      "   padding: 0 16px;",
      "}",
      ".embedding-container .progress-txt{",
      "   line-height: 19px;",
      "}",
      ".embedding-container .pc-car-message{",
      "   display: inline-block;",
      "}",
      ".embedding-container .pad-car-message{",
      "   display: none;",
      "}",
      ".embedding-container .car-message-item{",
      "   margin-bottom: 25px;",
      "}",
      ".embedding-container .progress-bar_outer{",
      "   margin: 10px 0;",
      "}",
      ".embedding-container .loading-hint{",
      "   padding-bottom: 18px;",
      "}",
      ".embedding-container .car-txt{",
      "   left: 16px;",
      "   right: auto;",
      "   top: auto;",
      "   bottom: 105px;",
      "   padding: 0;",
      "}",
      "@media screen and (min-width:1500px) {",
      ".max-pc-screen .car-txt{",
      // '   right: calc((100% - 1200px) / 2);', // 10.57% 203px
      "   right: 10.57%;",
      // '   top: 36.66%;',
      "}",
      "}",
      "@media screen and (min-width:1200px) {",
      ".max-pc-screen .car-txt{",
      "   right: calc((100% - 1200px) / 2);", // 10.57% 203px
      // '   right: 10.57%;',
      // '   top: 36.66%;',
      "}",
      "}",
    ].join("\n");

    var style = document.createElement("style");
    style.type = "text/css";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    document.head.appendChild(style);
  };

  var UIAdapter = function () {
    var deviceWidth = 0;
    if (
      document.documentElement.clientWidth <
      document.documentElement.clientHeight
    ) {
      deviceWidth = document.documentElement.clientWidth;
    } else {
      deviceWidth = document.documentElement.clientHeight;
    }

    document.documentElement.style.fontSize = deviceWidth / 3.6 + "px";
    var ConstNumber = window.devicePixelRatio;
    app.graphicsDevice._maxPixelRatio = ConstNumber;
    var Height = document.body.offsetHeight;
    var Width = document.body.offsetWidth;
    var loadUI = document.getElementById("application-splash-wrapper");
    loadUI.style.left = "0px";
    loadUI.style.width = Width.toString() + "px";
    loadUI.style.height = Height.toString() + "px";
    loadUI.style.transform = "rotate(0deg)";
    return;
    if (!window.isRotate) {
      loadUI.style.left = "0px";
      loadUI.style.width = Width.toString() + "px";
      loadUI.style.height = Height.toString() + "px";
      loadUI.style.transform = "rotate(0deg)";
      return;
    }
    if (Width > Height || window.isIframe) {
      loadUI.style.left = "0px";
      loadUI.style.width = Width.toString() + "px";
      loadUI.style.height = Height.toString() + "px";
      loadUI.style.transform = "rotate(0deg)";
    } else {
      loadUI.style.left = Width.toString() + "px";
      loadUI.style.width = Height.toString() + "px";
      loadUI.style.height = Width.toString() + "px";
      loadUI.style.transform = "rotate(90deg)";
    }
  };
  let resize = function () {
    // var Height = document.body.offsetHeight;
    // var Width = document.body.offsetWidth;
    // if (os.isPc && !os.isTablet) {
    //     if (Width < Height) {
    //         sessionStorage.setItem("isMagicWindow", "1")
    //     } else {
    //         sessionStorage.setItem("isMagicWindow", "0")
    //     }
    // }
    setLoadingPage();
    setEmbedding();
    UIAdapter();
  };

  window.addEventListener("message", function (e) {
    if (e.data.channel) localStorage.setItem("device", e.data.channel);
    if (typeof e.data.channel === "string" && e.data.channel !== "apk") {
      window.channel = e.data.channel;
      sessionStorage.setItem("isMagicWindow", "0");
      window.isIframe = false;
      setEmbedding();
      UIAdapter();
    }
    if (typeof e.data.isMagicWindow === "boolean") {
      sessionStorage.setItem("isMagicWindow", e.data.isMagicWindow ? "1" : "0");
      setEmbedding();
      window.isIframe = false;
      UIAdapter();
      // document.getElementById("application-splash-wrapper").classList.add("disLoad")
    }
  });
  window.addEventListener("resize", resize);
  createCss();
  showSplash();
  if (window["editor"]) {
    SCENE_NAME = {
      50080100039: "1771771.json",
      50080100041: "1788825.json",
      50080100050: "1793497.json",
      50080100057: "1833111.json",
      VR: "1829658.json",
      50080100109: "1880864.json",
      50080100121: "1917231.json",
      50080100137: "1979026.json",
      50080100143: "2000130.json",
      50080100157: "2034333.json",
      50080100181266: "2063146.json",
      DelayLoadAssets: "none",
      5008010013301: "2171955.json",
    };
    //解析url参数,获取加载场景文件
    var url = location.search;
    var params = [];
    if (url.indexOf("?") != -1) {
      var str = url.substr(1);
      var strs = str.split("&");
      for (var i = 0; i < strs.length; i++) {
        params[strs[i].split("=")[0]] = decodeURIComponent(
          strs[i].split("=")[1],
        );
      }
    }
    SCENE_PATH = SCENE_NAME[params.SN];
    SCENE_PATH_SN = params.SN;
    var AssetPreloadMgr = {};

    AssetPreloadMgr.preloadTags = [];
    AssetPreloadMgr.currentIndex = 0;
    AssetPreloadMgr.resourcesLoaded = 0;

    AssetPreloadMgr.loadAssetLoadConfig = function (app, callback, scope) {
      var configAssetTag = "assetsConfig";
      var assets = app.assets.findByTag(configAssetTag);
      if (!assets || assets.length <= 0) {
        if (typeof callback === "function") callback.call(scope, null);
        return;
      }
      var configAsset = assets[0];
      if (configAsset.resource) {
        var i;
        var assetsTags = null;
        for (var i = 0; i < configAsset._resources.length; i++) {
          if (configAsset._resources[i].sceneName === SCENE_PATH_SN) {
            assetsTags = configAsset._resources[i].assetsTags;
            break;
          }
        }
        if (assetsTags instanceof Array) {
          AssetPreloadMgr.preloadTags.length = 0;
          for (i = 0; i < assetsTags.length; ++i) {
            AssetPreloadMgr.preloadTags.push(assetsTags[i].tags);
          }
        }
        if (typeof callback === "function") {
          callback.call(scope);
        }
      } else {
        configAsset.once(
          "load",
          AssetPreloadMgr.loadAssetLoadConfig.bind(this, app, callback, scope),
          this,
        );
        app.assets.load(configAsset);
      }
    };

    AssetPreloadMgr.setPreloadByTag = function (tags, isPreload) {
      if (isPreload === undefined) {
        isPreload = true;
      } else {
        isPreload = !!isPreload;
      }
      if (!(tags instanceof Array)) {
        tags = [tags];
      }
      var assets = pc.app.assets.findByTag.apply(pc.app.assets, tags);
      if (!assets || assets.length <= 0) return;
      var preloadDef = Object.getOwnPropertyDescriptor(
        pc.Asset.prototype,
        "preload",
      );
      var use_preload_getter = !!preloadDef.get;
      assets.forEach(function (asset) {
        if (!asset) return;
        asset.preload = isPreload;
        if (use_preload_getter) {
          asset._preload = isPreload;
        } else {
          asset.preload = isPreload;
        }
      });
    };
    AssetPreloadMgr.setPreload = function (callback, scope) {
      AssetPreloadMgr.loadAssetLoadConfig(pc.app, function () {
        AssetPreloadMgr.setPreloadByTag(AssetPreloadMgr.preloadTags, true);
        if (typeof callback === "function") callback.call(scope);
      });
    };

    AssetPreloadMgr.injectAppPreload = function () {
      var AppClass = pc.AppBase || pc.Application;
      if (!pc || !AppClass) return;
      if (
        AppClass.prototype.originPreloadFunc &&
        AppClass.prototype.originPreloadFunc !== AppClass.prototype.preload
      )
        return;
      AppClass.prototype.originPreloadFunc = AppClass.prototype.preload;
      // AssetPreloadMgr.preload = AppClass.prototype.preload;
      AppClass.prototype.preload = function (callback) {
        AppClass.prototype.isPreloaded = false;
        AssetPreloadMgr.setPreload(function () {
          AppClass.prototype.isPrecompiled = true;
          AppClass.prototype.preloadCallback = callback;
          AppClass.prototype.originPreloadFunc.call(this, function () {
            AppClass.prototype.isPreloaded = true;
            if (AppClass.prototype.isPrecompiled) {
              if (typeof AppClass.prototype.preloadCallback == "function") {
                AppClass.prototype.preloadCallback();
                AppClass.prototype.preloadCallback = null;
              }
            }
          });
        }, this);
      };
    };
    AssetPreloadMgr.injectAppPreload();
  }
  app.on("preload:end", function () {
    window.preloadEnd = +new Date();
    app.off("preload:progress");
  });
  app.on("preload:progress", setProgress);
  app.on("start", hideSplash);

  //JS注册事件监听
  function connectWebViewJavascriptBridge(callback) {
    if (window.WebViewJavascriptBridge) {
      callback(WebViewJavascriptBridge);
    } else {
      document.addEventListener(
        "WebViewJavascriptBridgeReady",
        function () {
          window.WebViewJavascriptBridge;
          callback(WebViewJavascriptBridge);
        },
        false,
      );
    }
  }
  //初始化
  connectWebViewJavascriptBridge(function (bridge) {
    console.log("安卓操作初始化完成");
    bridge.init(function (message, responseCallback) {
      var data = {
        "Javascript Responds": "Wee!",
      };
      responseCallback(data);
    });
    //app通知版本号
    bridge.registerHandler("set_version_num", function (data) {
      console.log("当前版本号", data);
    });
  });
  //
  setTimeout(() => {
    // 回调控制在10s内
    if (
      window.WebViewJavascriptBridge &&
      window.WebViewJavascriptBridge.callHandler
    ) {
      window.WebViewJavascriptBridge.callHandler(
        "initAisle",
        "初始化完成",
        function (data) {
          console.log("回调参数", data);
        },
      );
    }
  }, 5000);

  function setEmbedding() {
    window.embedding = sessionStorage.getItem("isMagicWindow") === "1";
    // window.embedding ? document.body.classList.add("embedding-container") : document.body.classList.remove("embedding-container");
    if (document.getElementById("application-splash-wrapper"))
      setLoadingPage(
        document.getElementById("application-splash-wrapper"),
        document.getElementsByClassName("loadbg")[0],
      );
    !window.isLandscape || window.embedding
      ? document.body.classList.add("embedding-container")
      : document.body.classList.remove("embedding-container");
  }
});
