var CarHallJs = pc.createScript('carHallJs');
CarHallJs.attributes.add('swiperIndex', {
    type: Number,
    default: 0
})
CarHallJs.attributes.add('routerIndex', {
    type: Number,
    default: 1
})
CarHallJs.attributes.add('swiperData', {
    type: Array,
    default: []
})
CarHallJs.attributes.add('carData', {
    type: Array,
    default: [
        [
            {
                id: 5,
                imgName: 'car-hall-car5.png',
                imgId: 154956444,
                name: '智界 S7',
                list: ["24.98万", "2820mm", "EVR（增程式混动）", "5020 x 1945 x 1760mm"]
            }
        ],
        [
            {
                id: 1,
                imgName: 'car-hall-car4.png',
                imgId: 147456393,
                name: '问界 新M7 大五座',
                list: ["24.98万", "2820mm", "EVR（增程式混动）", "5020 x 1945 x 1760mm"]
            },
            {
                id: 2,
                imgName: 'car-hall-car1.png',
                imgId: 142198963,
                name: '问界M5 智驾版',
                list: ["27.98万", "2880mm", "EVR（增程式混动）", "4770 x 1930 x 1625mm"]
            },
            {
                id: 3,
                imgName: 'car-hall-car2.png',
                imgId: 142198962,
                name: '问界M5 纯电智驾版',
                list: ["28.98万", "2880mm", "EV（纯电动）", "4785 x 1930 x 1620mm"]
            },
            {
                id: 4,
                imgName: 'car-hall-car3.png',
                imgId: 142198964,
                name: '问界M5 标准版 2023款',
                list: ["24.98万", "2880mm", "EVR（增程式混动）", "4770 x 1930 x 1625mm"]
            },
            {
                id: 5,
                imgName: 'car-hall-car3.png',
                imgId: 142198964,
                name: '问界 新M5 增程 Max RS',
                list: ["****万", "****mm", "EVR（增程式混动）", "4785 x 1930 x 1625mm"]
            }
        ]
    ]
})
CarHallJs.attributes.add('swiperStatus', {
    type: Number,
    default: 0
})
CarHallJs.attributes.add('tabIndex', {
    type: "number",
    default: 1
})
var carHallJs;
// initialize code called once per entity
CarHallJs.prototype.initialize = function () {
    console.log("CarHallJs init")
    CarHallJs = this;
    carHallJs = this;
    //延迟1.8s打开UI
    this.mOpenUiTimer = 0;
    this.mIsOpenUI = false;

    this.isResetActive = true;
    this.isDisabled = false;
    this.mCloseWroldUI = false;
    //是否已经关闭UI
    this.mIsCloseWroldUI = false;
    this.SCENENAME = ["f1", "evr", "ev", "23", "x2"];
    this.HideSplash();
    CarHallJs.setBtnShow();
    this.mVM_main_root = document.GetComponent("VM-main-root");
    this.on("destroy", function () {
        this.mVM_main_root.parentElement.removeChild(this.mVM_main_root);
        console.log("销毁脚本 CarHallJs")
        window.removeEventListener("message", CarHallJs.messageEvent);
        window.removeEventListener("resize", CarHallJs.resizeEl);
    }.bind(this));
    this.GetWorldSpaceUI();
    h6.on("OnClickUI", function (entity) {
        this.RaycastHitEvent(entity.tags._list[1]);
    }.bind(this), this)
    $(".car-hall-main .VM-header-btn").on("click", function () {
        let index = Number($(this).attr('data-index'));
        switch (index) {
            case 3:
                carHallJs.SelectCarUI(false);
                setTimeout(function () {
                    // 进入选车
                    $('.car-hall-main').hide();
                    $(".car-select-main").show();
                    $('.VM-icon-back').show();
                    CarHallJs.routerIndex = 2;
                }.bind(this), 800)

                break;
            case 4:
                window.parent.postMessage({
                    code: '0',
                    click: 'share' // 点击事件标识，share:分支、consult:在线咨询、appointment:立即预约
                }, '*');
                break;
        }
    })
    // swiper上一个下一个
    $(".car-hall-swiper-button").on("click", function () {
        let type = Number($(this).attr("data-index"));
        CarHallJs.changeSwiper(type);
    })
    // 全景看车
    $(".car-hall-swiper-wrapper").on("click", ".swiper-slide-btn", function (e) {
        let index = Number(e.target.dataset.index);
        console.log('你点击了全景看车' + index);
        Const.mCurSelectedCarId = index;
        carHallJs.RaycastHitEvent(carHallJs.SCENENAME[index - 1]);
    })
    // 切换tab
    $(".car-select-main .tab-btn").on("click", function (e) {
        let tabIndex = Number(e.target.dataset.tab);
        if (tabIndex !== CarHallMeue.tabIndex) {
            $(".car-select-main .tab-btn").removeClass("active");
            $(this).addClass("active");
            CarHallJs.resetSwiper(tabIndex);

        }
    })
    // 返回按钮
    $(".car-select-main .VM-icon-back,.car-hall-main  .VM-icon-back").on("click", function () {
        carHallJs.SelectCarUI(true);
        let routerIndex = CarHallJs.routerIndex; // 1首页的返回按钮 2 选车的返回按钮
        if (routerIndex === 1) {
            window.parent.postMessage({
                code: '0',
                click: 'back' //点击事件标识，share:分支、consult:在线咨询、appointment:立即预约
            }, '*');
        }
        if (routerIndex === 2) {
            $('.car-hall-main').show();
            $(".car-select-main").hide();
            CarHallJs.routerIndex = 1;
            // if (window.ENVIRNOMENT === "vmallhall") $('.VM-icon-back').hide();
            CarHallJs.changeSwiper(3);
        }
    })
    // swiper手势操作
    let startClient = 0;// 滑动距离
    $(".car-hall-swiper").on("touchstart mousedown", function (e) {
        // console.log("手势开始");
        var Height = document.body.offsetHeight;
        var Width = document.body.offsetWidth;
        if (Width >= Height) {
            if (e.type === "touchstart") startClient = e.targetTouches[0].pageX;
            if (e.type === "mousedown") startClient = e.pageX;
        } else {
            if (e.type === "touchstart") startClient = e.targetTouches[0].pageY;
            if (e.type === "mousedown") startClient = e.pageY;
        }

        CarHallJs.swiperStatus = 1
    })
    $(".car-hall-swiper").on("touchmove mousemove", function () {
        // console.log("手势移动");
        if (CarHallJs.swiperStatus === 1) CarHallJs.swiperStatus = 2
    })
    $(".car-hall-swiper").on("touchend mouseup", function (e) {
        // console.log("手势结束");
        if (CarHallJs.swiperStatus === 2) {
            let endClient = 0,
                client = 10;//滑动距离判定
            var Height = document.body.offsetHeight;
            var Width = document.body.offsetWidth;
            if (Width >= Height) {
                if (e.type === "touchend") endClient = e.changedTouches[0].pageX;
                if (e.type === "mouseup") endClient = e.pageX;
            } else {
                if (e.type === "touchend") endClient = e.changedTouches[0].pageY;
                if (e.type === "mouseup") endClient = e.pageY;
            }

            if ((endClient - startClient) > client) {
                // 向右
                if (CarHallJs.swiperIndex != 0) CarHallJs.changeSwiper(1);
            }

            if ((endClient - startClient) < -client) {
                // 向左
                if (CarHallJs.swiperIndex != CarHallJs.swiperData.length - 1) CarHallJs.changeSwiper(2);
            }
            swiperStatus = 0
        }
        CarHallJs.swiperStatus = 0
    })

    CarHallJs.initContent(true);
}
CarHallJs.prototype.getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
CarHallJs.prototype.initContent = function (df = false) {

    if (df) {
        //网页加载完成调用
        if (window.WebViewJavascriptBridge && window.WebViewJavascriptBridge.callHandler) {
            window.WebViewJavascriptBridge.callHandler('initAisle', "初始化完成", function (data) {
                console.log("回调参数", data);
            });
        }
        // if (window.ENVIRNOMENT === "vmallhall") {
        //     $(".VM-share-btn").addClass("display_none");
        //     $(".VM-icon-back").hide();
        // } else {
        //     $(".VM-icon-back").show();
        // }
        $(".VM-icon-back").show();
    }
    CarHallJs.resizeEl();
    CarHallJs.resetSwiper(1);

    window.addEventListener("message", CarHallJs.messageEvent);
    window.addEventListener("resize", CarHallJs.resizeEl);
    // TODO 开始统计
    if (window.ENVIRNOMENT === "vmallhall") {
        CarHallJs.setStat("20000", "4428");
    }
    if (window.ENVIRNOMENT === "vmallbeta") {
        CarHallJs.setStat("20000", "4433");
    }
}
// 统计
CarHallJs.prototype.setStat = function (ProjectID, ClientID) {
    if (window.gblStat) window.gblStat.close()
    if (ClientID && window.W3DStat) {
        if (window.W3DStat) { window.gblStat = new W3DStat(ProjectID, ClientID); }
        var _ONLOAD_TIME = +new Date();
        gblStat.postData("onload", _ONLOAD_TIME);
        gblStat.postData("firstFrameComplete", window.firstFrameComplete)
        gblStat.postData("preloadEnd", window.preloadEnd)
    }
}
CarHallJs.prototype.resizeEl = function () {
    var Height = document.body.offsetHeight;
    var Width = document.body.offsetWidth;
    let proportion = Width / Height;
    if (proportion > 2.54 || proportion < 0.39) {
        $(".car-hall-swiper-wrapper").addClass("car-hall-small-swiper");
    } else {
        $(".car-hall-swiper-wrapper").removeClass("car-hall-small-swiper");
    }
}
CarHallJs.prototype.changeSwiper = function (type = 2) {
    if (type === 1) {
        $('.car-hall-swiper .swiper-button-to-top').hide();
        if (CarHallJs.swiperIndex === CarHallJs.swiperData.length - 1) $('.car-hall-swiper .swiper-button-next').show();
        CarHallJs.swiperIndex = CarHallJs.swiperIndex - 1;
        if (CarHallJs.swiperIndex === 0) $('.car-hall-swiper .swiper-button-prev').hide();
    }
    if (type === 2) {
        if (CarHallJs.swiperIndex === 0) $('.car-hall-swiper .swiper-button-prev').show();
        CarHallJs.swiperIndex = CarHallJs.swiperIndex + 1;
        if (CarHallJs.swiperIndex === CarHallJs.swiperData.length - 1) {
            $('.car-hall-swiper .swiper-button-next').hide();
            $('.car-hall-swiper .swiper-button-to-top').show();
        }
    }
    if (type === 3) {
        CarHallJs.swiperIndex = 0;
        $('.car-hall-swiper .swiper-button-prev').hide();
        CarHallJs.swiperData.length > 1 ? $('.car-hall-swiper .swiper-button-next').show() : $('.car-hall-swiper .swiper-button-next').hide();
        $('.car-hall-swiper .swiper-button-to-top').hide();
    }
    CarHallJs.setCarHallSwiper();
    // CarHallJs.setCarDiagramSwiper();
}
CarHallJs.prototype.setCarHallSwiper = function () {
    $('.car-hall-swiper-slide').removeClass('active').eq(CarHallJs.swiperIndex).addClass('active')
    let index = CarHallJs.swiperIndex;
    let data = CarHallJs.swiperData;
    $('.car-hall-swiper-wrapper').css('transform', 'translateX(-' + index * 52.565 + '%)');
    $('.car-swiper-title').text(data[index].name);
    let swiperHtml = '',
        listName = ['建议起售价', '轴距', '能源类型', '车身尺寸'];
    data[index].list.forEach((item, key) => {
        let startEl = key % 2 === 0 ? '<div class="car-message-group">' : '';
        let endEl = key % 2 !== 0 ? '</div>' : '';

        swiperHtml += `${startEl}<div class="car-message-item" style="${key === 3 ? "margin-right: 0;" : ""}">
                    <div class="car-message-item-content">
                        ${item}${key === 0 ? '<span>起</span>' : ''}
                    </div >
                    <div class="car-message-item-title">
                        ${listName[key]}
                    </div>
                </div > ${endEl}`;

    })
    $('.car-hall-text .car-message').html(swiperHtml);
}

CarHallJs.prototype.resetSwiper = function (tabIndex) {
    CarHallMeue.tabIndex = tabIndex;
    CarHallJs.swiperData = CarHallJs.carData[tabIndex - 1];
    let imgHtml = '',
        data = CarHallJs.swiperData;
    data.forEach((item, key) => {
        imgHtml += `<div class="car-hall-swiper-slide ${key === 0 ? 'active' : 0}">
                    <img src="${CarHallJs.setSrc(item.imgId, item.imgName)}" alt="">
                    <button class="swiper-slide-btn" data-index="${item.id}">全景看车</button>
                </div>`;
    })

    $('.car-hall-swiper-wrapper').html(imgHtml);
    CarHallJs.changeSwiper(3);
}
CarHallJs.prototype.messageEvent = function (e) {
    if (e.data.channel) {
        localStorage.setItem("device", e.data.channel);
        CarHallJs.setBtnShow();
    }
    if (typeof e.data.isMagicWindow === 'boolean') {
        window.embedding = e.data.isMagicWindow;
        sessionStorage.setItem("isMagicWindow", e.data.isMagicWindow)
    }
}
CarHallJs.prototype.setBtnShow = function () {
    let device = localStorage.getItem("device");
    if (device === 'apk') {
        $(".VM-share-btn").css("display", "inline-block");
    } else {
        $(".VM-share-btn").hide();
    }
}
CarHallJs.prototype.setSrc = function (id, name) {
    var src = '';
    if (window['editor'])
        src = 'https://playcanvas.com/api/assets/' + id + '/file/' + name;
    else
        src = 'files/assets/' + id + '/1/' + name;

    return src;
};
// update code called every frame
CarHallJs.prototype.update = function (dt) {
    // this.CompareDist();
    this.FollowPoint(this.mWorldSpaceUI.children)
    if (!this.mIsOpenUI) {
        this.mOpenUiTimer += dt;
        if (this.mOpenUiTimer < 2) return;
    }
    if (camera.maxLimitAngleHall < 300) {
        if (!this.mIsCloseWroldUI) {
            this.mIsCloseWroldUI = true;
            this.mWorldSpaceUI.enabled = false;
        }
    }
    else {
        if (this.mIsCloseWroldUI) {
            this.mWorldSpaceUI.enabled = true;
            this.mIsCloseWroldUI = false;
        }
    }
};
CarHallJs.prototype.SelectCarUI = function (open) {
    if (open) {
        mainMgr.StepChangeAgent(0);
    }
    else {
        mainMgr.StepChangeAgent(1);
    }
    this.mCarRoot.enabled = open;
    this.mWorldSpaceUI.enabled = open;
}

CarHallJs.prototype.HideSplash = function () {
    this.splash = document.getElementById('application-splash-wrapper');
    if (this.splash) {
        this.splash.style.display = "none";
        this.splash.parentElement.removeChild(this.splash);
    }
}
CarHallJs.prototype.GetWorldSpaceUI = function () {
    this.mWorldSpaceUI = this.app.root.findByName("WorldSpaceUI");
    setTimeout(function () {
        this.mIsOpenUI = true;
        this.mWorldSpaceUI.enabled = true;
        for (var i = 0; i < this.mWorldSpaceUI.children.length; i++) {
            this.FadeInEntity(this.mWorldSpaceUI.children[i], new pc.Vec2(.998, 1));
        }
    }.bind(this), 1800)
    this.mM5Ev = this.mWorldSpaceUI.findByName("hotspot_ev");
    this.mM5Evr = this.mWorldSpaceUI.findByName("hotspot_evr");
    this.mRoot_M5_CarHall = this.app.root.findByName('Root_M5_CarHall');
    this.mCarRoot = this.app.root.findByName("CarRoot");
}
/**
 * @pointList：场景中的点位
 * @dt：deltatime 固定帧
 */
CarHallJs.prototype.FollowPoint = function (pointList) {
    for (var i = 0; i < pointList.length; i++) {
        cameraHandle.LookAt(pointList[i]);
    }
};
CarHallJs.prototype.OnCloseWroldUI = function (pointList) {
    for (var i = 0; i < pointList.length; i++) {
        cameraHandle.LookAt(pointList[i]);
    }
};
/**
 * 当个车ui事件
 */
CarHallJs.prototype.RaycastHitEvent = function (tag) {
    h6.off()
    var sceneName = "50080100041"
    switch (tag) {
        case "evr":
            sceneName = "50080100039"
            Const.mCurSelectedCarId = 1;
            break;
        case "23":
            sceneName = "50080100050"
            Const.mCurSelectedCarId = 2;
            break;
        case "ev":
            sceneName = "50080100041"
            Const.mCurSelectedCarId = 3;
            break;
        case "f1":
            sceneName = "50080100057"
            Const.mCurSelectedCarId = 4;
            break;
        case "x2":
            sceneName = "50080100109"
            Const.mCurSelectedCarId = 5;
            break;
    }
    SceneLoadMgr.LoadHref(sceneName);
    // sceneMgr.LoadHref(sceneName)
    // sceneMgr.LoadScene(sceneName, sceneId, function () {
    //     // this.mVM_main_root.parentElement.removeChild(this.mVM_main_root);
    //     // console.log("销毁场景")
    // }.bind(this));
}
var minDistIdx = -1;
CarHallJs.prototype.CompareDist = function () {
    if (camera.hallUIIsShow) {
        this.isResetActive = true;
        if (!this.isDisabled) {
            this.isDisabled = true;
            var id = this.FindminDistIdx(this.mWorldSpaceUI, camera.entity)
            for (var i = 0; i < this.mWorldSpaceUI.children.length; i++) {
                // this.mWorldSpaceUI.children[i].enabled = id === i;
                if (id !== i) {
                    this.FadeOutEntity(this.mWorldSpaceUI.children[i], new pc.Vec2(0, 1));
                }
            }
        }
    }
    else {
        this.isDisabled = false;
        if (this.isResetActive) {
            this.isResetActive = false;
            for (var i = 0; i < this.mWorldSpaceUI.children.length; i++) {
                // this.mWorldSpaceUI.children[i].enabled = true;
                this.FadeInEntity(this.mWorldSpaceUI.children[i], new pc.Vec2(.998, 1));
            }
        }
    }
}
CarHallJs.prototype.FindminDistIdx = function (_entity, _mainEntity) {
    if (!_entity) return;
    if (!_entity.children) return;
    if (_entity.children.length > 0) {
        //默认0最远
        var maxDist = _mainEntity.getPosition().distance(_entity.children[0].getPosition());
        minDistIdx = 0;
        for (var i = 1; i < _entity.children.length; i++) {
            var dist = _mainEntity.getPosition().distance(_entity.children[i].getPosition());
            if (dist < maxDist) {
                maxDist = dist;
                minDistIdx = i;
            }
        }
    }
    return minDistIdx;
}

//淡出工具
CarHallJs.prototype.FadeOutEntity = function (entity, toValue, duration = 0.4, callback = null) {
    var v2 = new pc.Vec2(0.999, 0);
    // 使用 tween 将实体的 opacity 属性从原始值渐变为 0
    this.app.tween(v2)
        .to(toValue, duration, pc[this.easing])
        .onUpdate(function () {
            if (entity.render) {
                renders = entity.render;
            }
            else {
                renders = entity.children[0].render;
            }
            if (renders !== null) {
                renders.material.setParameter("material_opacity", v2.x);
            }
        })
        .onComplete(function () {
            // 在 tween 完成时触发，可以执行回调函数
            if (callback) {
                callback();
            }
        })
        .start();
}
//淡入工具
CarHallJs.prototype.FadeInEntity = function (entity, toValue, duration = 0.4, callback = null) {
    var v2 = new pc.Vec2(0, 0);
    // 使用 tween 将实体的 opacity 属性从原始值渐变为 0
    this.app.tween(v2)
        .to(toValue, duration, pc[this.easing])
        .onUpdate(function () {
            if (entity.render) {
                renders = entity.render;
            }
            else {
                renders = entity.children[0].render;
            }
            if (renders !== null) {
                renders.material.setParameter("material_opacity", v2.x);
            }
        })
        .onComplete(function () {
            // 在 tween 完成时触发，可以执行回调函数
            if (callback) {
                callback();
            }
        })
        .start();
}