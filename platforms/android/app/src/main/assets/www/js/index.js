const apiAddress = 'http://localhost:8114/';
// const apiAddress = 'http://10.52.101.32:8001/';
// const apiAddress = 'http://91.167.224.138:16854/';
const bodyParts = ['Head', 'Ears', 'LeftHand', 'RightHand', 'LeftArm', 'RightArm', 'LeftLeg', 'RightLeg', 'LeftShoulder', 'RightShoulder'];
const races = [["VIKING", "brightness(0.75) sepia(1)",1,1, "Les Vikings ont une meilleure résistance aux dégats."],
    ["ROUGEGUARDE", "brightness(0.35) sepia(1)",1,1, "Les Rougegardes ont plus de chance d'infliger des coups critiques."],
    ["ORC", "sepia(67%) saturate(3000%) hue-rotate(50deg) brightness(75%) contrast(79%)",2,1, "Les Orcs ont plus de points de vie."],
    ["ELF", "brightness(0.75) sepia(1)",1,2, "Les Elfs ont plus de chance d'esquiver les coups."],
    ["REPTILIEN", "sepia(1) saturate(2000%) hue-rotate(167deg) brightness(80%)",3,1, "Les Réptiliens ont plus de dégats."]];
let apearance = {'noRace':[1,1,5], 'noHair':[1,0,18], 'noMouth':[1, 1, 6], 'noBeard':[1, 0, 6], 'noEyes':[1, 1, 6], 'noEyebrows':[1, 1, 6],
    'colorEyes': [
        0, ['none', 'hue-rotate(100deg) saturate(1)', 'hue-rotate(300deg) saturate(1)', 'hue-rotate(250deg) saturate(5)', 'sepia(1) saturate(60) grayscale(1)'],
        ['Eyes']],
    'colorHair': [
        0, ['sepia(1) saturate(250%)', 'brightness(0.55) sepia(1)', 'brightness(0.4)', 'brightness(1.1)', 'sepia(23%) saturate(1600%) hue-rotate(338deg) brightness(89%) contrast(84%)'],
        ['Hair', 'Beard', 'Eyebrows']]};
let step = 1;
let oldTab = null;
let selectedQuest = 'quest1';

let questTimer;
var typingTimer;
var $input = $('#heroName');
var $loader = $(".icon-container");
var $submit = $('.finish-button');

document.addEventListener("deviceready", function() {
    if(window.localStorage.getItem("userHero") !== null)
        displayGame();
    else
        endBlackScreen();
    for (let [index, item] of Object.entries(apearance)) {
        if (index.substring(0, 2) === 'no') {
            let elem = index.substring(2);
            $('#prev' + elem).on('touchstart', function () {
                regenElement(elem);
            });
            $('#next' + elem).on('touchstart', function () {
                regenElement(elem, true);
            });
        }
        if (index.substring(0, 5) === 'color') {
            let elem = index.substring(5);
            $('.color-picker-' + elem.toLowerCase()).on('touchstart', function () {
                apearance['color'+elem][0] = $(this).attr('datasrc');
                colorElement(elem, $(this).attr('datasrc'));
            });
        }
    }
    $('.next-step-button').on('touchstart', function () {
        step++;
        changeStep();
    });
    $('.prev-step-button').on('touchstart', function () {
        step--;
        changeStep();
    });
    $('#raceLabel').on('touchstart', function () {
        $("#raceHelpPopup").css('display', 'block');
    }).on('touchend', function () {
        $("#raceHelpPopup").css('display', 'none');
    });
    $input.on('keyup', function () {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(doneTyping, 1000);
    });
    $input.on('keydown', function () {
        clearTimeout(typingTimer);
        neutralValidation();
    });
    regenLadder();
});
function regenElement(elem, add=false) {
    let i = apearance['no' + elem][0] - 1;
    let min = apearance['no' + elem][1];
    let max = apearance['no' + elem][2];
    if (add)
        i+=2;
    if (i <= min-1)
        i = max;
    if (i >= max+1)
        i = min;
    apearance['no' + elem][0] = i;
    if(elem === 'Race'){
        return regenRace();
    }
    $('#hero'+elem).css('background-image', 'url(img/heros/'+elem+'/' + i + '.png)');
}

function regenRace(r = null) {
    r=(r===null?races[apearance['noRace'][0]-1]:races[r-1]);
    $('#raceLabelText').text(r[0]);
    bodyParts.forEach((i)=> $('#hero'+i).css('filter', r[1]));
    $('.baseHeroPart').css('filter', r[1]);
    $('#heroHead').css('background-image', "url(img/heros/"+r[2]+".png)");
    $('#heroEars').css('background-image', "url(img/heros/Ears/"+r[3]+".png)");
    $('#raceHelpPopup').text(r[4]);
}

function colorElement(elem, colorId){
    apearance['color'+elem][2].forEach((i) => $('#hero'+i).css('filter', apearance['color'+elem][1][colorId]));
}

function changeStep(del= false) {
    $("#c-step1").css('display', 'none');
    $("#c-step2").css('display', 'none');
    $("#c-step3").css('display', 'none');
    (!del?$("#c-step"+step).css('display', 'block'):'');
}

function doneTyping () {
    $loader.css("display","block");
    $.ajax({
        url: apiAddress+"checkHero/"+$input.val().toLowerCase(),
    })
        .done(function( data ) {
            if (JSON.parse(data)) {
                activateValidation();
            }
            else {
                disableValidation();
            }
        });
}

function activateValidation(){
    $loader.css("display","none");
    $input.css("box-shadow","inset 0 0 7px 1px #71a12d");
    $submit.css("background-image","url(img/ui/btn_check.png)");
    $submit.bind("touchstart", submit);
}
function disableValidation() {
    neutralValidation();
    $input.css("box-shadow","inset 0 0 7px 1px #FE5D26");
}
function neutralValidation(){
    $submit.unbind("touchstart", submit);
    $loader.css("display","none");
    $input.css("box-shadow", "none");
    $submit.css("background-image","url(img/ui/btn_check_disabled.png)");
}

function submit(){
    let i = [];
    window.localStorage.setItem('appPassword','_' + Math.random().toString(36).substr(2, 9));
    for (let [index, item] of Object.entries(apearance))
        i.push(item[0]);
    initBlackScreen();
    $.ajax({
        url: apiAddress+"register",
        dataType: 'json',
        data: JSON.stringify({
            'name':$input.val().toLowerCase(),
            'password':window.localStorage.getItem('appPassword'),
            'appearance':i,
        }),
        method: 'POST'
    })
        .done(function( data ) {
            window.localStorage.setItem('userHero', JSON.stringify(data));
            displayGame();
        });
}

function initBlackScreen() {
    $("#blackScreen").css('height', '100%').animate({opacity: '1'},500, "linear");
}

function endBlackScreen() {
    $("#blackScreen").animate({opacity: '0'},500, "linear",
        function(){
            $("#blackScreen").css('height', '0');
        });
}

function displayGame(){
    checkLogin().done(function(){
        endBlackScreen();
        changeStep(true);
        $(".c-card").css('background-position-y', '20px');
        $(".heroBody").css('transform', 'scale(0.75)')
            .css('padding-top', '105px');
        $("#game").show();
        initUi();
        initAppearance();
        if(Object.keys(JSON.parse(localStorage.getItem('userHero'))['quests']).length === 1){
            displayActiveQuest();
        }
        else{
            changeQuest('quest0');
        }
        $("#questTab").on('touchstart', function() {
            toggleTab('quest');
        });
        $("#stuffTab").on('touchstart', function() {
            toggleTab('stuff');
        });
        $("#socialTab").on('touchstart', function() {
            toggleTab('social');
        });
        $("#shopTab").on('touchstart', function() {
            toggleTab('shop');
        });
        $(".questItem").on('touchstart', function() {
            changeQuest($(this).attr('id'));
        });
        $("#switchStats").on('touchstart', switchStats);
        $("#validateQuest").on('touchstart', validateQuest);
        $(".buyChest").on('touchstart', function(){
            buyChest($(this).attr('datasrc'))
        });
        $("#backStatsButton").on('touchstart', backToStats);

        updrageStatBtns = $('.iconStats.add').on('touchstart', function(){
            upgradeStat($(this).attr('id'));
        });
        $(".stuffPiece").on('touchstart', function(){
            stuffDetails($(this).attr('id'));
        });
        $("#equipButton").on('touchstart', function(){
            equipStuff($(this).attr('datasrc'));
        });
        $("#sellStuffButton").on('touchstart', function(){
            sellStuff($(this).attr('datasrc'));
        });
        $("#panoInfoButton").on('touchstart', function(){
            panoInfo($(this).attr('datasrc'));
        });
        $("#xpLabel").on('touchstart', function () {
            tooltipXp();
        });
        $(".stuffStat").on('touchstart', function () {
            tooltipStats($(this).children("[id^=statsHero]").attr('id').substr(-1));
        });
        $("#tooltip").on('touchstart', function () {
            $("#tooltip").css('display', 'none');
        });
        //btn de test
        $("#getCristalsButton").on('touchstart', testFx);
    });
}
function testFx() {
    fightStart();
}
function initAppearance(){
    let shortHair = '';
    if(JSON.parse(localStorage.getItem('userHero'))['helmet'] !== null)
        shortHair = (JSON.parse(localStorage.getItem('userHero'))['helmet']['template']['rarity'] === '3'?'':'0');
    let hero = JSON.parse(localStorage.getItem('userHero'))['appearance'];
    regenRace(hero['race']['id']);
    $("#heroHair").css('background-image', 'url(img/heros/Hair/' + shortHair + hero['hair'] + '.png)');
    $("#heroBeard").css('background-image', 'url(img/heros/Beard/' + hero['beard'] + '.png)');
    $("#heroEyes").css('background-image', 'url(img/heros/Eyes/' + hero['eyes'] + '.png)');
    $("#heroEyebrows").css('background-image', 'url(img/heros/Eyebrows/' + hero['eyebrows'] + '.png)');
    $("#heroMouth").css('background-image', 'url(img/heros/Mouth/' + hero['mouth'] + '.png)');
    colorElement('Hair', hero['hairColor']);
    colorElement('Eyes', hero['eyesColor']);
    renderStuff();
}
function renderStuff() {
    let hero = JSON.parse(localStorage.getItem('userHero'));
    let gotPartialStuff = false;
    let setStuff = [];
    $('.stuffPiece').each(function (index) {
        let type = $( this ).attr('id').substr(0, $( this ).attr('id').length-5);
        if(hero[type] !== null && type !== 'res'){
            if(hero[type]['template']['image'] !== 'none') {
                if(hero[type]['template']['image'].substr(0, 8) === 'partial/')
                    gotPartialStuff = true;
                let typeUpper = type.charAt(0).toUpperCase() + type.slice(1);
                $('#' + type + 'Stuff').css({backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')'});
                if(hero[type]['template']['rarity']>1)
                    setStuff.push(hero[type]['template']['image'].substr(0,4));
                if (type.substr(-1) === 's') {
                    typeUpper = typeUpper.substr(0, typeUpper.length - 1);
                    $('#heroRight' + typeUpper).css({
                        backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')',
                        filter: 'none'
                    });
                    $('#heroLeft' + typeUpper).css({
                        backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')',
                        filter: 'none'
                    });
                    if (type === 'shoulders')
                        $('#heroLeftArm').css({
                            backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')',
                            filter: 'none'
                        });
                    if (type === 'hands') {
                        $('#heroRightArm').css({
                            backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')',
                            filter: 'none'
                        });
                        $('#heroRightThumb').css({backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')'});
                        $('#heroLeftGauntlet').css({backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')'});
                        $('#handsStuff .hoverStuff').css({backgroundImage: 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')'});
                    }
                } else {
                    if (typeUpper === 'Weapon' || typeUpper === 'Helmet') {
                        $('#hero' + typeUpper).css('background-image', 'url(img/equipment/' + typeUpper + '/' + hero[type]['template']['image'] + ')');
                        $('#' + type + 'Stuff').css({backgroundImage: 'url(img/equipment/' + typeUpper + '/' + hero[type]['template']['image'] + ')'});
                    } else
                        $('#hero' + typeUpper).css('background-image', 'url(img/equipment/Stuffs/' + hero[type]['template']['image'] + ')');
                }
            }
        }
        else if(type === 'res'){
            let item = JSON.parse(localStorage.getItem('userHero'))['reserve'][
                Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[$( this ).attr('id').substr(-1)]];
            if(item !== undefined){
                type=item['template']['type']['name'];
                let relativeStuff =  $('#'+type.toLowerCase()+'Stuff');
                $( this ).css({backgroundImage: 'url(img/equipment/' + (type!=='Weapon'&&type!=='Helmet'?'Stuffs':type) + '/' + item['template']['image'] + ')',
                    backgroundPosition: relativeStuff.css('background-position'),
                    backgroundSize: relativeStuff.css('background-size')
                }).html('');
                if(type === 'Hands'){
                    $('#handsStuff .hoverStuff').clone().css({backgroundImage: 'url(img/equipment/Stuffs/' + item['template']['image'] + ')'}).appendTo( this );
                }
            }
            else{
                $( this ).css({backgroundImage: ''}).html('');
            }
        }
        else if(hero[type] === null){
            let typeUpper = type.charAt(0).toUpperCase() + type.slice(1);
            $('#' + type + 'Stuff').css({backgroundImage: ''});
            $('#hero' + typeUpper).css({backgroundImage: ''});
        }
    });
    function distinct(value, index, self) {
        return self.indexOf(value) === index;
    }
    $('#heroRightHand').css({opacity: 1});
    if(setStuff.filter(distinct).length === 1 && setStuff.length === 7){
        $('#heroSupplies').css({
            backgroundImage: 'url(img/equipment/Supplies/' + setStuff[0].substr(0, 4) + '.png)',
            marginLeft: '60px',
            marginTop: '60px',
            height: '250px'
        });
        if(setStuff[0].substr(0, 4) === 'Pala')
            $('#heroRightHand').css({opacity: 0});
        if(setStuff[0].substr(0, 4) === 'Samo' || setStuff[0].substr(0, 4) === 'Abju')
            $('#heroSupplies').css({
                marginLeft: '140px',
                marginTop: '15px',
                height: '275px'
            })
    }
    else
        $('#heroSupplies').css({backgroundImage: 'none'});
    console.log(setStuff.filter(distinct).length+' '+setStuff.length )
    $('.baseHeroPart').css('display', (gotPartialStuff?'block':'none'));
}

function initUi() {
    let info = JSON.parse(localStorage.getItem('userHero'));
    $("#gold").text(info['gold']);
    $("#cristal").text(info['cristal']);
    initXp();
    initStats();
}

function initXp() {
    let lvl = JSON.parse(localStorage.getItem('userHero'))['level'];
    let xp = JSON.parse(localStorage.getItem('userHero'))['experience'];
    let xpMax = 10*Math.pow(lvl, 1.6);
    let cssPerXp = (xp * 84)/xpMax;

    $('.xpBack').width(cssPerXp+'px');
    $('#xpLabel').text(lvl);
}

function initStats() {
    let data = JSON.parse(localStorage.getItem('userHero'));
    if(data['weapon'] === null) {
        data['weapon'] = {element: {id: data['appearance']['race']['bonusElement']['id']}, damages: [1, 1], template:{image: 'none'}, stats: [0, 0, 0, 0, 0]};
        localStorage.setItem('userHero', JSON.stringify(data));
    }
    data['stats'][data['appearance']['race']['bonusElement']['id']-1]+=Math.round(data['stats'][data['appearance']['race']['bonusElement']['id']-1]/5);
    $('#statsHero'+data['appearance']['race']['bonusElement']['id']).css({fontWeight: 600, color: 'rgb(34, 184, 73)'});
    let stuffs = ['weapon', 'shoulders', 'helmet', 'chest', 'belt', 'hands', 'legs'];
    stuffs.forEach(function(stuff) {
        if(data[stuff] != null) {
            for (let i = 0; i < 5; i++) {
                data['stats'][i] += data[stuff]['stats'][i];
            }
        }
    });
    if(data['upgradePoint'] === 0)
        $('.iconStats.add').hide();
    else
        $('.iconStats.add').show();
    data['stats'].forEach(function (stat, i) {
        $('#statsHero'+(i+1)).text(stat);
    });
    $('#weaponStats #statsHeroWeapon').text(data['weapon']['damages'][0] + ' - ' + data['weapon']['damages'][1]);
    $('#weaponStats .punchIcon').removeClass().addClass('iconQuest punchIcon element'+ data['weapon']['element']['id']);
    $('#statsHeroDamages').text(data['stats'][0]);
    let cc = Math.min(data['stats'][1]*10/data['level'],50);
    $('#statsHeroCC').text(Math.round(cc)+"%");
    let baseDamages = data['stats'][0]+data['stats'][data['weapon']['element']['id']-1];
    let weaponTrue = [baseDamages+data['weapon']['damages'][0],baseDamages+data['weapon']['damages'][1]];
    $('#statsHeroWeaponTrue').text(weaponTrue[0]+' - '+weaponTrue[1]);
    let life = data['stats'][2]*5+50;
    $('#statsHeroLife').text(life);
    $('#statsHeroResistence').text(data['stats'][3]);
    let dodge = Math.min(data['stats'][4]*10/data['level'],50);
    $('#statsHeroDodge').text(Math.round(dodge)+'%');
    $('#upgradePoints').text(data['upgradePoint']);
}

function changeQuest(quest){
    selectedQuest = quest;
    let data = JSON.parse(localStorage.getItem('userHero'))['quests'][
        Object.keys(JSON.parse(localStorage.getItem('userHero'))['quests'])[quest.substr(-1)]];
    $('.questItem').show();
    for(let i=0; i <= 2; i++){
        if("quest"+i===quest){
            $("#"+quest).css("box-shadow", "#d2d2d2 0 0 5px inset")
                .css("opacity", 1);
        }
        else{
            $("#quest"+i).css("box-shadow", "none")
                .css("opacity", 0.5);
        }
    }
    data['monster']['stats'].forEach(function(x, index){
        $("#elem"+index+"Quest").text(x);
    });
    $("#chronoQuest").text(formatToTime(data['duration']));
    $("#goldQuest").text(data['gold']);
    $("#xpQuest").text(data['experience']);
    $("#weaponQuest").text(data['monster']['weapon']['damages'].join(' - '));
    $("#weaponElemQuest").removeClass()
        .addClass('iconQuest punchIcon element'+data['monster']['weapon']['element']['id']);
    renderMonsterQuest(quest.substr(-1));
}
function renderMonsterQuest() {
    let monster = JSON.parse(localStorage.getItem('userHero'))['quests'][
        Object.keys(JSON.parse(localStorage.getItem('userHero'))['quests'])[selectedQuest.substr(-1)]]
        ['monster']['appearance'];
    $(".monsterBodyPart").css('background-image', 'url(img/monster/Body/'+monster['race']+'/'+monster['body']+'.png)');
    $(".monsterHead").css('background-image', 'url(img/monster/Head/'+monster['race']+'/'+monster['head']+'.png)');
    $(".monsterEyes").css('background-image', 'url(img/monster/Eyes/'+monster['race']+'/'+monster['eyes']+'.png)');
    $(".monsterEars").css('background-image', 'none');
    $(".monsterMouth").css('background-image', 'none');
    $(".furryEars").css('background-image', 'none');
    switch (monster['race']) {
        case 'Furry':
            $(".furryEars").css('background-image', 'url(img/monster/Ears/'+monster['race']+'/'+monster['ears']+'.png)');
            $(".monsterMouth").css('background-image', 'url(img/monster/Mouth/'+monster['race']+'/'+monster['mouth']+'.png)');
            break;
        case 'Mummies':
            $(".monsterEars").css('background-image', 'url(img/monster/Ears/'+monster['race']+'/'+monster['ears']+'.png)');
            break;
        case 'Skeletons':
            break;
        default:
            $(".monsterEars").css('background-image', 'url(img/monster/Ears/'+monster['race']+'/'+monster['ears']+'.png)');
            $(".monsterMouth").css('background-image', 'url(img/monster/Mouth/'+monster['race']+'/'+monster['mouth']+'.png)');
            break;
    }
}
function validateQuest() {
    let noQuest = selectedQuest.substr(-1);
    $('.questItem').hide();
    $('#validateQuest').hide();
    $.ajax({
        url: apiAddress+"api/validateQuest",
        dataType: 'json',
        data: JSON.stringify({'noQuest':noQuest}),
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        },
        method: 'POST',
        statusCode: {
            401: function () {
                checkLogin().done(function(){
                    validateQuest();
                });
            }
        }
    }).success(function( data ) {
        window.localStorage.setItem('userHero', JSON.stringify(data));
        displayActiveQuest();
    });
}
function displayActiveQuest() {
    changeQuest('quest0');
    $('#progressQuestInner').css('width', '0px');
    $('#progressQuest').show();
    $('.questItem').hide();
    $('#validateQuest').hide();
    questTimer = setInterval(questProgress, 250);
}
function questProgress(){
    let quest = JSON.parse(localStorage.getItem('userHero'))['quests'][Object.keys(JSON.parse(localStorage.getItem('userHero'))['quests'])[0]];
    let timeLeft = (Date.parse(quest.endDate) - Date.now()) / 1000;
    if(timeLeft<0){
        questFinish();
        clearInterval(questTimer);
    }
    let start = Date.parse(quest.endDate) - quest.duration*1000 ;
    $('#progressQuestInner').css('width', (((Date.now() - start) / (Date.parse(quest.endDate)-start))*100)+'%').css('width', '-=3px');
    $('#progressQuestLabel').text(formatToTime(Math.ceil(timeLeft)));
}
function questFinish(){
    $.ajax({
        url: apiAddress+"api/finishQuest",
        dataType: 'json',
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        },
        method: 'POST',
        statusCode: {
            401: function () {
                checkLogin().done(function(){
                    questFinish();
                });
            }
        }
    }).success(function( data ) {
        let q = JSON.parse(window.localStorage.getItem('userHero'))['quests'];
        window.localStorage.setItem('actualQuest', JSON.stringify(q[Object.keys(q)[0]]));
        window.localStorage.setItem('userHero', JSON.stringify(data['hero']));
        window.localStorage.setItem('fight', JSON.stringify(data['fight']));
        hideTabs();
        fightStart();
    });
}
function fightStart(){
    let monsterAppearance = JSON.parse(localStorage.getItem('actualQuest'))['monster']['appearance'];
    let heroAppearance = JSON.parse(localStorage.getItem('userHero'))['appearance'];
    let sixVw = window.innerWidth*0.06;
    $('#progressQuest').hide();
    $('.monsterBody').clone().attr('id', 'monsterFight').appendTo('.c-card').css({
        position: 'fixed',
        transform: 'scale(-0.75,0.75)',
        top: '147px',
        right: '50px',
        transformOrigin: '125px 110px',
        width: '0',
        height: '0',
    }).animate({right: (sixVw+178)+'px'}, 750, 'linear');
    $('.heroBody').animate({  left: (sixVw-68)+'px' },750, 'linear');
    $('.c-card').animate({ backgroundPositionX: '-=31vw' }, 750, 'linear', function () {
        console.log(JSON.parse(window.localStorage.getItem('fight')));
        let fightData = JSON.parse(window.localStorage.getItem('fight'));
        let baseLife = [fightData[0][2][0],fightData[0][2][1]+fightData[0][1]];
        $('#lifebarHero p').text(baseLife[0]);
        $('#lifebarMonster p').text(baseLife[1]);
        $('.lifebar').show();
        let idx = 0;
        let poison=false;
        function doNext() {
            let phase = fightData[idx];
            let attacker = (idx%2===0?0:1);
            let defender = (idx%2===0?1:0);
            if(phase[0] !== 'silence')
                $((attacker===0?'#hero':'#monsterFight .monster')+'LeftArmBlock').transition({ rotate: (phase[0]==='crit'?'-700deg':'-245deg') }, 600, 'ease').transition({ rotate: '0deg' }, 400, 'ease');
            else
                setTimeout(function () {
                    if(attacker===0)
                        $('.heroBody > #heroEyes').css('background-image', 'url(img/heros/Eyes/' + heroAppearance['eyes'] + '.png)');
                    else
                        $('#monsterFight > .monsterEyes').css('background-image', 'url(img/monster/Eyes/' + monsterAppearance['race'] + '/' + monsterAppearance['eyes'] + '.png)');
                }, 1000);
                //// PANOPLIE EFFECT ////
            let timeoutNext = 1000;
            if(phase[4] !== undefined) {
                if(phase[4][0] === 'counter'){
                    timeoutNext = 1600;
                    let direction = (attacker === 0 ? 'right' : 'left');
                    $('#panoFX').css({
                        backgroundImage: 'url(../img/equipment/Supplies/AbjuLight.png)',
                        transform: 'scale(0)',
                        opacity: 1
                    });
                    setTimeout(function () {
                        $('#panoFX').css(direction, (window.innerWidth * 0.05 - 70) + 'px')
                            .css('display', 'block')
                            .transition({scale: 1.5}, 700, 'ease')
                            .transition({opacity: 0}, 200, 'ease');
                        let per = phase[2][attacker] * 100 / baseLife[attacker];
                        $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' .innerLife').animate({width: per + '%'}, 400, 'swing');
                        $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' p').text(phase[2][attacker]);
                    }, 400);
                    $((attacker === 1 ? '#hero' : '#monsterFight .monster') + 'RightArmBlock')
                        .transition({rotate: '-40deg'}, 500, 'ease')
                        .transition({rotate: '-40deg'}, 500, 'ease')
                        .transition({rotate: '0deg'}, 300, 'ease');

                }
            }
            if(phase[3] !== undefined) {
                if (phase[3][0] === 'poison') {
                    $('#panoFX').css('background-image', 'url(../img/equipment/Supplies/Poison.png)');
                    if (phase[3][1] && poison) {
                        timeoutNext = 1600;
                        setTimeout(function () {
                            $('.fightDamagesText').text(phase[3][2]).css({
                                fontSize: '30px',
                                textShadow: '#9a59ff 3px 0px 0px, #9a59ff 2.83487px 0.981584px 0px, #9a59ff 2.35766px 1.85511px 0px, #9a59ff 1.62091px 2.52441px 0px, #9a59ff 0.705713px 2.91581px 0px, #9a59ff -0.287171px 2.98622px 0px, #9a59ff -1.24844px 2.72789px 0px, #9a59ff -2.07227px 2.16926px 0px, #9a59ff -2.66798px 1.37182px 0px, #9a59ff -2.96998px 0.42336px 0px, #9a59ff -2.94502px -0.571704px 0px, #9a59ff -2.59586px -1.50383px 0px, #9a59ff -1.96093px -2.27041px 0px, #9a59ff -1.11013px -2.78704px 0px, #9a59ff -0.137119px -2.99686px 0px, #9a59ff 0.850987px -2.87677px 0px, #9a59ff 1.74541px -2.43999px 0px, #9a59ff 2.44769px -1.73459px 0px, #9a59ff 2.88051px -0.838247px 0px'
                            })
                                .css({opacity: '1', top: '168px'}).animate({opacity: '0', top: '148px'}, 500, 'swing');
                        }, 1600);
                        poison = phase[3][1];
                    } else if (phase[3][1] && !poison) {
                        timeoutNext = 2000;
                        setTimeout(function () {
                            $((attacker === 0 ? '#hero' : '#monsterFight .monster') + 'RightArmBlock').transition({rotate: '-200deg'}, 600, 'ease').transition({rotate: '0deg'}, 400, 'ease');
                            let y = window.innerWidth - 140;
                            let x = window.innerWidth * 0.6 - 140;
                            let poison = (attacker === 0 ? 'right' : 'left');
                            $('#heroSupplies').transition({rotate: '60deg', x: x, y: -y, delay: 700}, 400, 'ease');
                            $('#panoFX').css(poison, (window.innerWidth * 0.05 - 70) + 'px')
                                .css('display', 'block')
                                .transition({opacity: 1, rotate: '20deg', delay: 1000}, 200, 'linear')
                                .transition({opacity: 0, rotate: '40deg'}, 200, 'linear');
                            setTimeout(function () {
                                $('#heroSupplies').css('opacity', 0).transition({
                                    rotate: '60deg',
                                    x: 0,
                                    y: 0
                                }, 0, 'ease');
                            }, 1200);

                        }, 1000);
                        poison = phase[3][1];
                    }
                }
                if (phase[3][0] === 'heal') {
                    timeoutNext = 2200;
                    $('#panoFX').css('background-image', 'url(../img/equipment/Supplies/ElemLight.png)');
                    setTimeout(function () {
                        if (attacker === 0)
                            $('.fightDamagesText').css({left: '20vw', right: '', transform: 'translateX(-50%)'});
                        else
                            $('.fightDamagesText').css({left: '', right: '16vw', transform: 'translateX(50%)'});
                        let light = (attacker === 0 ? 'left' : 'right');
                        $('#panoFX').css(light, (window.innerWidth * 0.05 - 70) + 'px')
                            .css('display', 'block')
                            .transition({opacity: 1}, 450, 'linear')
                            .transition({opacity: 0}, 450, 'linear');
                        $((defender === 1 ? '.heroBody > #heroEyes' : '#monsterFight > .monsterEyes')).css('background-image', "url(img/heros/Eyes/Healing.png)");
                        $('.fightDamagesText').text(phase[3][1]).css({
                            fontSize: '30px',
                            textShadow: '#71a12d 3px 0px 0px, #71a12d 2.83487px 0.981584px 0px, #71a12d 2.35766px 1.85511px 0px, #71a12d 1.62091px 2.52441px 0px, #71a12d 0.705713px 2.91581px 0px, #71a12d -0.287171px 2.98622px 0px, #71a12d -1.24844px 2.72789px 0px, #71a12d -2.07227px 2.16926px 0px, #71a12d -2.66798px 1.37182px 0px, #71a12d -2.96998px 0.42336px 0px, #71a12d -2.94502px -0.571704px 0px, #71a12d -2.59586px -1.50383px 0px, #71a12d -1.96093px -2.27041px 0px, #71a12d -1.11013px -2.78704px 0px, #71a12d -0.137119px -2.99686px 0px, #71a12d 0.850987px -2.87677px 0px, #71a12d 1.74541px -2.43999px 0px, #71a12d 2.44769px -1.73459px 0px, #71a12d 2.88051px -0.838247px 0px',
                            opacity: '1',
                            top: '168px'
                        }).animate({opacity: '0', top: '148px'}, 900, 'swing');
                        setTimeout(function () {
                            $("#heroEyes").css('background-image', 'url(img/heros/Eyes/' + JSON.parse(localStorage.getItem('userHero'))['appearance']['eyes'] + '.png)');
                        }, 900);
                        let per = phase[2][attacker] * 100 / baseLife[attacker];
                        $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' .innerLife').animate({width: per + '%'}, 400, 'swing');
                        $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' p').text(phase[2][attacker]);
                    }, 1600);
                }
                if (phase[3][0] === 'silence') {
                    timeoutNext = 2200;
                    $('#panoFX').css({
                        backgroundImage: 'url(../img/equipment/Supplies/Song.png)',
                        transform: 'scale(0)',
                        opacity: 1
                    });
                    setTimeout(function () {
                        let song = (attacker === 0 ? 'left' : 'right');
                        $('#panoFX').css(song, (window.innerWidth * 0.05 - 70) + 'px')
                            .css('display', 'block')
                            .transition({scale: 1}, 700, 'ease')
                            .transition({opacity: 0}, 200, 'ease');
                        $((defender === 1 ? '.heroBody > #heroEyes' : '#monsterFight > .monsterEyes')).css({backgroundImage: "url(img/heros/Eyes/Healing.png)"});
                        $((defender === 1 ? '.heroBody > #heroMouth' : '#monsterFight > .monsterMouth')).css({backgroundImage: "url(img/heros/Mouth/Sing.png)"});
                        $((attacker === 1 ? '.heroBody > #heroEyes' : '#monsterFight > .monsterEyes')).css({backgroundImage: "url(img/heros/Eyes/Confused.png)"});
                        setTimeout(function () {
                            $("#heroEyes").css('background-image', 'url(img/heros/Eyes/' + heroAppearance['eyes'] + '.png)');
                            $("#heroMouth").css('background-image', 'url(img/heros/Mouth/' + heroAppearance['mouth'] + '.png)');
                        }, 900);
                    }, 1600);
                }
                if (phase[3][0] === 'steal' && phase[0] !== 'dodge') {
                    $('#panoFX').css('background-image', 'url(../img/equipment/Supplies/Regen.png)');
                    if (attacker === 0)
                        $('.fightHealText').css({left: '20vw', right: '', transform: 'translateX(-50%)'});
                    else
                        $('.fightHealText').css({left: '', right: '16vw', transform: 'translateX(50%)'});
                    setTimeout(function () {
                            $('.fightHealText').text(phase[3][1]).css({
                                fontSize: '30px',
                                textShadow: '#71a12d 3px 0px 0px, #71a12d 2.83487px 0.981584px 0px, #71a12d 2.35766px 1.85511px 0px, #71a12d 1.62091px 2.52441px 0px, #71a12d 0.705713px 2.91581px 0px, #71a12d -0.287171px 2.98622px 0px, #71a12d -1.24844px 2.72789px 0px, #71a12d -2.07227px 2.16926px 0px, #71a12d -2.66798px 1.37182px 0px, #71a12d -2.96998px 0.42336px 0px, #71a12d -2.94502px -0.571704px 0px, #71a12d -2.59586px -1.50383px 0px, #71a12d -1.96093px -2.27041px 0px, #71a12d -1.11013px -2.78704px 0px, #71a12d -0.137119px -2.99686px 0px, #71a12d 0.850987px -2.87677px 0px, #71a12d 1.74541px -2.43999px 0px, #71a12d 2.44769px -1.73459px 0px, #71a12d 2.88051px -0.838247px 0px',
                                opacity: '1',
                                top: '168px'
                            }).animate({opacity: '0', top: '148px'}, 900, 'swing');
                            let per = phase[2][attacker] * 100 / baseLife[attacker];
                            $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' .innerLife').animate({width: per + '%'}, 400, 'swing');
                            $('#lifebar' + (defender === 1 ? 'Hero' : 'Monster') + ' p').text(phase[2][attacker]);
                            let regen = (attacker === 0 ? 'left' : 'right');
                            $('#panoFX').css(regen, (window.innerWidth * 0.05 - 70) + 'px')
                                .css({display: 'block', opacity: 1, transform: 'translateY(50px)'})
                                .transition({y: -150, opacity: 0}, 900, 'ease');
                            setTimeout(function () {
                                $('#panoFX').css({transform: ''});
                            }, 900);
                        },650);
                }
                if (phase[3][0] === 'double') {
                    timeoutNext = 2200;
                    setTimeout(function () {
                        $((attacker === 0 ? '#hero' : '#monsterFight .monster') + 'RightArmBlock').transition({rotate: '-245deg'}, 600, 'ease').transition({rotate: '0deg'}, 400, 'ease');
                    }, 1200);
                    setTimeout(function () {
                        $('.fightDamagesText').text(phase[3][2]).css({
                            fontSize: '30px',
                            textShadow: 'rgb(255, 196, 43) 3px 0px 0px, rgb(255, 196, 43) 2.83487px 0.981584px 0px, rgb(255, 196, 43) 2.35766px 1.85511px 0px, rgb(255, 196, 43) 1.62091px 2.52441px 0px, rgb(255, 196, 43) 0.705713px 2.91581px 0px, rgb(255, 196, 43) -0.287171px 2.98622px 0px, rgb(255, 196, 43) -1.24844px 2.72789px 0px, rgb(255, 196, 43) -2.07227px 2.16926px 0px, rgb(255, 196, 43) -2.66798px 1.37182px 0px, rgb(255, 196, 43) -2.96998px 0.42336px 0px, rgb(255, 196, 43) -2.94502px -0.571704px 0px, rgb(255, 196, 43) -2.59586px -1.50383px 0px, rgb(255, 196, 43) -1.96093px -2.27041px 0px, rgb(255, 196, 43) -1.11013px -2.78704px 0px, rgb(255, 196, 43) -0.137119px -2.99686px 0px, rgb(255, 196, 43) 0.850987px -2.87677px 0px, rgb(255, 196, 43) 1.74541px -2.43999px 0px, rgb(255, 196, 43) 2.44769px -1.73459px 0px, rgb(255, 196, 43) 2.88051px -0.838247px 0px'
                        }).css({opacity: '1', top: '168px'}).animate({opacity: '0', top: '148px'}, 500, 'swing');
                    }, 1800);
                }
            }
            /////////////////////////
            setTimeout(function(){
                if(phase[0]==='dodge')
                    $((attacker===1?'.heroBody':'#monsterFight')).transition({ rotateY: '0deg', rotate: '0deg', y: '-30px' }, 200, 'ease').transition({ y: '0px' }, 200, 'ease');
                if(attacker === 1 && phase[0] !== 'silence' && (typeof phase[4] !== 'undefined'?phase[4][0] !== 'counter':true))
                    $('.fightDamagesText').css({left: '20vw', right: '', transform: 'translateX(-50%)'});
                else
                    $('.fightDamagesText').css({left: '', right: '16vw', transform: 'translateX(50%)'});
                $('#lifebar'+(defender===0?'Hero':'Monster')+' p').text(phase[2][defender]);
                let per = phase[2][defender] * 100 / baseLife[defender];
                switch (phase[0]) {
                    case 'crit':
                        $('.fightDamagesText').text(phase[1]).css({fontSize: '45px', textShadow: 'rgb(217, 91, 91) 3px 0px 0px, rgb(217, 91, 91) 2.83487px 0.981584px 0px, rgb(217, 91, 91) 2.35766px 1.85511px 0px, rgb(217, 91, 91) 1.62091px 2.52441px 0px, rgb(217, 91, 91) 0.705713px 2.91581px 0px, rgb(217, 91, 91) -0.287171px 2.98622px 0px, rgb(217, 91, 91) -1.24844px 2.72789px 0px, rgb(217, 91, 91) -2.07227px 2.16926px 0px, rgb(217, 91, 91) -2.66798px 1.37182px 0px, rgb(217, 91, 91) -2.96998px 0.42336px 0px, rgb(217, 91, 91) -2.94502px -0.571704px 0px, rgb(217, 91, 91) -2.59586px -1.50383px 0px, rgb(217, 91, 91) -1.96093px -2.27041px 0px, rgb(217, 91, 91) -1.11013px -2.78704px 0px, rgb(217, 91, 91) -0.137119px -2.99686px 0px, rgb(217, 91, 91) 0.850987px -2.87677px 0px, rgb(217, 91, 91) 1.74541px -2.43999px 0px, rgb(217, 91, 91) 2.44769px -1.73459px 0px, rgb(217, 91, 91) 2.88051px -0.838247px 0px'});
                        $('#lifebar'+(defender===0?'Hero':'Monster')+' .innerLife').animate({ width: per+'%' }, 400, 'swing');
                        break;
                    case 'damages':
                        $('.fightDamagesText').text(phase[1]).css({fontSize: '30px', textShadow: 'rgb(255, 196, 43) 3px 0px 0px, rgb(255, 196, 43) 2.83487px 0.981584px 0px, rgb(255, 196, 43) 2.35766px 1.85511px 0px, rgb(255, 196, 43) 1.62091px 2.52441px 0px, rgb(255, 196, 43) 0.705713px 2.91581px 0px, rgb(255, 196, 43) -0.287171px 2.98622px 0px, rgb(255, 196, 43) -1.24844px 2.72789px 0px, rgb(255, 196, 43) -2.07227px 2.16926px 0px, rgb(255, 196, 43) -2.66798px 1.37182px 0px, rgb(255, 196, 43) -2.96998px 0.42336px 0px, rgb(255, 196, 43) -2.94502px -0.571704px 0px, rgb(255, 196, 43) -2.59586px -1.50383px 0px, rgb(255, 196, 43) -1.96093px -2.27041px 0px, rgb(255, 196, 43) -1.11013px -2.78704px 0px, rgb(255, 196, 43) -0.137119px -2.99686px 0px, rgb(255, 196, 43) 0.850987px -2.87677px 0px, rgb(255, 196, 43) 1.74541px -2.43999px 0px, rgb(255, 196, 43) 2.44769px -1.73459px 0px, rgb(255, 196, 43) 2.88051px -0.838247px 0px'});
                        $('#lifebar'+(defender===0?'Hero':'Monster')+' .innerLife').animate({ width: per+'%' }, 400, 'swing');
                        break;
                    case 'dodge':
                        $('.fightDamagesText').text('DODGE').css({fontSize: '30px', textShadow: 'rgb(43, 134, 173) 3px 0px 0px, rgb(43, 134, 173) 2.83487px 0.981584px 0px, rgb(43, 134, 173) 2.35766px 1.85511px 0px, rgb(43, 134, 173) 1.62091px 2.52441px 0px, rgb(43, 134, 173) 0.705713px 2.91581px 0px, rgb(43, 134, 173) -0.287171px 2.98622px 0px, rgb(43, 134, 173) -1.24844px 2.72789px 0px, rgb(43, 134, 173) -2.07227px 2.16926px 0px, rgb(43, 134, 173) -2.66798px 1.37182px 0px, rgb(43, 134, 173) -2.96998px 0.42336px 0px, rgb(43, 134, 173) -2.94502px -0.571704px 0px, rgb(43, 134, 173) -2.59586px -1.50383px 0px, rgb(43, 134, 173) -1.96093px -2.27041px 0px, rgb(43, 134, 173) -1.11013px -2.78704px 0px, rgb(43, 134, 173) -0.137119px -2.99686px 0px, rgb(43, 134, 173) 0.850987px -2.87677px 0px, rgb(43, 134, 173) 1.74541px -2.43999px 0px, rgb(43, 134, 173) 2.44769px -1.73459px 0px, rgb(43, 134, 173) 2.88051px -0.838247px 0px'});
                        break;
                    case 'silence':
                        $('.fightDamagesText').text('Zzz').css({fontSize: '30px', textShadow: 'rgb(43, 134, 173) 3px 0px 0px, rgb(43, 134, 173) 2.83487px 0.981584px 0px, rgb(43, 134, 173) 2.35766px 1.85511px 0px, rgb(43, 134, 173) 1.62091px 2.52441px 0px, rgb(43, 134, 173) 0.705713px 2.91581px 0px, rgb(43, 134, 173) -0.287171px 2.98622px 0px, rgb(43, 134, 173) -1.24844px 2.72789px 0px, rgb(43, 134, 173) -2.07227px 2.16926px 0px, rgb(43, 134, 173) -2.66798px 1.37182px 0px, rgb(43, 134, 173) -2.96998px 0.42336px 0px, rgb(43, 134, 173) -2.94502px -0.571704px 0px, rgb(43, 134, 173) -2.59586px -1.50383px 0px, rgb(43, 134, 173) -1.96093px -2.27041px 0px, rgb(43, 134, 173) -1.11013px -2.78704px 0px, rgb(43, 134, 173) -0.137119px -2.99686px 0px, rgb(43, 134, 173) 0.850987px -2.87677px 0px, rgb(43, 134, 173) 1.74541px -2.43999px 0px, rgb(43, 134, 173) 2.44769px -1.73459px 0px, rgb(43, 134, 173) 2.88051px -0.838247px 0px'});
                        break;
                }
                    $('.fightDamagesText').css({opacity: '1', top: '168px'}).animate({opacity: '0', top: '148px'}, 900, 'swing');
            }, 650);
            idx++;
            if(idx < fightData.length){
                setTimeout(doNext, timeoutNext);
            }
            else{
                setTimeout(function () {
                    let heroDie = (phase[2][0]<=0);
                    $((heroDie?'.heroBody > #heroEyes':'#monsterFight > .monsterEyes')).css('background-image', "url(img/heros/Eyes/emoji/Dead.png)");
                    $((heroDie?'.heroBody > #heroShadow':'#monsterFight > .monsterShadow')).transition({opacity: 0});
                    $(heroDie?'.heroBody':'#monsterFight').transition({rotate: '-80deg', left:(heroDie? '-80px':'')}, 250)
                        .transition({rotate: '-90deg', left: (heroDie? (sixVw-184)+'px':''), paddingTop: (heroDie? '334px':''), top: (heroDie? '':'239px'), rotateY: '25deg'}, 250);
                    setTimeout(showFightResult,2000)
                    }, 650);
            }
        }
        setTimeout(doNext, 1000);
    });
}

function showFightResult() {
    let quest = JSON.parse(window.localStorage.getItem('actualQuest'));
    let fight = JSON.parse(window.localStorage.getItem('fight'));
    let hero = JSON.parse(window.localStorage.getItem('userHero'));
    $('#questResults').show().transition({opacity: '1'}, 250);
    $('.innerLife').css('width', '100%');
    $('#heroSupplies').css('opacity', 1);
    $('#poisonFX').css({left: '', right: '', display: 'none'})
        .transition({opacity: 0, rotate: '0deg'}, 0, 'linear');
    $('.lifebar').hide();
    $('#monsterFight').remove();
    $('.heroBody').attr('style', 'transform: scale(0.75, 0.75); padding-top: 105px;');
    changeQuest('quest0');
    $('#validateQuest').show();
    if(fight[fight.length-1][2][0]<=0){
        $('#questResults .title').append('<span class="skull"></span>DEFAITE<span class="skull"></span>');
    }
    else{
        $('#questResults .title').html('<span class="trophy"></span>VICTOIRE<span class="trophy"></span>');
        $('#questResults .menu').append('<p>Récompenses :</p>' +
            '<p><span class="gold"></span>'+quest['gold'] +
            '<span class="xp"></span>'+quest['experience']+'</p>');
    }
    if(hero['level'] > parseInt($('#xpLabel').text()))
        $('#questResults .menu').append('<p class="levelUpLabel">Niveau supérieur !</p>');
    $('#questResults .menu').append('<div id="endQuestBtn" class="menuBtn"></div>');
    initAppearance();
    initUi();
    $('#endQuestBtn').on('touchstart', function () {
        window.localStorage.removeItem('actualQuest');
        window.localStorage.removeItem('fight');
        $('#questResults').animate({opacity: '0'}, 750,
            function () {
                $('#questResults').hide();
                $('#questResults .menu').html('<p class="title"></p>');
        });
    })
}

function toggleTab(tab) {
    switch (tab) {
        case 'quest':
                $("#questActive").show().animate({bottom: "64px", height: Math.min(430, window.innerWidth*1.02)+"px"}, 500, "swing");
                $("#questTab").animate({opacity: 1});
            break;
        case 'stuff':
                $("#stuffActive").show().animate({top: "56px", height: "80vh"}, 500, "swing");
                $("#stuffTab").animate({opacity: 1});
            break;
        case 'social':
                $("#socialActive").show().animate({top: "0px"}, 500, "swing");
                $("#socialTab").animate({opacity: 1});
            break;
        case 'shop':
            $("#shopActive").show().animate({top: "0px"}, 500, "swing");
            $("#shopTab").animate({opacity: 1});
            break;
    }
    if(oldTab !== null){
        switch(oldTab){
            case 'quest':
                $("#questActive").animate({bottom: "0", height: "0"}, 500, "swing", function () {
                    $("#questActive").hide();
                });
                break;
            case 'stuff':
                $("#stuffActive").animate({top: "90vh", height:"0"}, 500, "swing", function () {
                    $("#stuffActive").hide();
                });
                break;
            case 'social':
                $("#socialActive").animate({top: "-516px"}, 500, "swing", function () {
                    $("#socialActive").hide();
                });
                break;
            case 'shop':
                $("#shopActive").animate({top: "-516px"}, 500, "swing", function () {
                    $("#shopActive").hide();
                });
                break;
        }
        $("#"+oldTab+"Tab").animate({opacity: 0.4});
    }
    if(oldTab === tab)
        oldTab=null;
    else
        oldTab = tab;
}
function hideTabs() {
    $("#questActive").animate({bottom: "0", height: "0"}, 500, "swing", function () {
        $("#questActive").hide();
    });
    $("#stuffActive").animate({top: "90vh", height:"0"}, 500, "swing", function () {
        $("#stuffActive").hide();
    });
    $("#socialActive").animate({top: "-516px"}, 500, "swing", function () {
        $("#socialActive").hide();
    });
    $("#shopActive").animate({top: "-516px"}, 500, "swing", function () {
        $("#shopActive").hide();
    });
    $("#questTab").animate({opacity: 0.4});
    $("#stuffTab").animate({opacity: 0.4});
    $("#shopTab").animate({opacity: 0.4});
    $("#socialTab").animate({opacity: 0.4});
    oldTab = null;
}

function switchStats() {
    if($('#switchStats').attr('datasrc') === '1'){
        $('#statsElement').hide();
        $('#statsDetails').show();
        $('#switchStats').attr('datasrc', '2');
    }
    else{
        $('#switchStats').attr('datasrc', '1');
        $('#statsElement').show();
        $('#statsDetails').hide();
    }
}

function formatToTime(time) {
    return (time > 0?(time>3600?Math.floor(time/3600)+':':'')+
        (time>=600?Math.floor(time/60)%60:'0'+Math.floor(time/60))+':'+
        (time%60>=10?time%60:'0'+time%60):'Terminé !');
}

function checkLogin() {
    let dfrd = $.Deferred();
    $.ajax({
        url: apiAddress+"login_check",
            dataType: 'json',
            contentType: 'application/json',
        data: JSON.stringify({
            'username':JSON.parse(window.localStorage.getItem('userHero'))['name'],
            'password':window.localStorage.getItem('appPassword')
        }),
        method: 'POST'
    }).success(function( data ) {
        window.localStorage.setItem('appToken', JSON.stringify(data));
        endBlackScreen();
        dfrd.resolve();
    });
    return dfrd.promise();
}

function upgradeStat(id) {
    id = id.substr(-1, 1);
    $('.iconStats.add').unbind('touchstart').css('filter', 'grayscale(100%)');
    $.ajax({
        url: apiAddress+"api/upStats",
        dataType: 'json',
        data: JSON.stringify({'elem':id}),
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        },
        method: 'POST',
        statusCode: {
            401: function () {
                checkLogin().done(function(){
                    questFinish();
                });
            }
        }
    }).success(function(data ) {
        let hero = JSON.parse(window.localStorage.getItem('userHero'));
        hero['upgradePoint']-=1;
        hero['stats'][id-1]+=1;
        window.localStorage.setItem('userHero', JSON.stringify(hero));
        initStats();
        $('.iconStats.add').on('touchstart', function(){
            upgradeStat($(this).attr('id'));
        }).css('filter', '');
    })
}

function stuffDetails(id) {
    let stuff = $('#'+id);
    if(stuff.css('background-image') !== 'none') {
        let stuffData = (id.substr(0,7)==='reserve'?
            JSON.parse(window.localStorage.getItem('userHero'))['reserve'][Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[id.substr(-1)]]:
            JSON.parse(window.localStorage.getItem('userHero'))[id.substr(0, id.length-5)]);
        $('#statsTable').hide();
        $('#stuffDetailsTable').show();
        $('#panoInfoButton').css("background-image","url(img/ui/btn_star.png)");
        $('#equipButton').show().attr('datasrc', id);
        if (id.substr(0, 7) === 'reserve') {
            $('#sellStuffButton').attr('datasrc', id).css('display', 'inline');
            $('#equipButton .middle').text('EQUIPER').css('background-image', 'url(img/ui/btn_green_back.png)');
            $('#equipButton .leftSide').css('background-image', 'url(img/ui/btn_green_left.png)');
            $('#equipButton .rightSide').css('background-image', 'url(img/ui/btn_green_right.png)');
        } else {
            $('#sellStuffButton').css('display', 'none');
            $('#equipButton .middle').text('RETIRER').css('background-image', 'url(img/ui/btn_red_back.png)');
            $('#equipButton .leftSide').css('background-image', 'url(img/ui/btn_red_left.png)');
            $('#equipButton .rightSide').css('background-image', 'url(img/ui/btn_red_right.png)');
        }
        if(stuffData['template']['set'] !== null){
            $('#panoInfoButton').attr('datasrc', id).css('display', 'inline');
        }
        else
            $('#panoInfoButton').css('display', 'none');
        $('#stuffImage').css({
            backgroundImage: stuff.css('background-image'),
            backgroundSize: stuff.css('background-size'),
            backgroundPosition: stuff.css('background-position')
        }).html('');
        $('#'+id+' .hoverStuff').clone().css({
            width: '18vw',
            height: '18vw',
            borderRadius: '18vw',
            backgroundOrigin: 'content-box',
            padding: '8vw'
        }).appendTo('#stuffImage');
        $('#stuffStatsList').html('');
        if(stuffData['damages'].length > 0){
            $('#weaponStats').clone().attr('id', 'weaponStatsDetail').appendTo('#stuffStatsList');
            $('#weaponStatsDetail .punchIcon').removeClass().addClass('iconQuest punchIcon element'+stuffData['element']['id']);
            $('#weaponStatsDetail #statsHeroWeapon').text(stuffData['damages'][0] + ' - ' + stuffData['damages'][1]);
        }
        let shadows = generateShadowsRarity(stuffData['template']['rarity']);
        $('#stuffName').css({textShadow: shadows[1]}).text(stuffData['template']['name']);
        $('#stuffImage').css({boxShadow: shadows[0]});
        stuffData['stats'].forEach(function (val, index) {
            if(val > 0){
                $('#stuffStatsList').append('<div class="stuffStat"><span class="iconStats element'+(index+1)+'"></span><span>'+val+'</span></div>')
            }
        });
    }
}
function backToStats() {
    $('#statsTable').show();
    $('#stuffDetailsTable').hide();
}
function sellStuff(id) {
    //confirmation menu
    let stuffData = JSON.parse(window.localStorage.getItem('userHero'))['reserve'][Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[id.substr(-1)]];
    let price = (parseInt(stuffData['template']['rarity'])+1)*stuffData['stats'].reduce((a, b) => a + b);
    $('#questResults .menu .title').text(stuffData['template']['name']);
    $('#questResults .menu').append('<p><span class="gold"></span>'+ price +'</p>' +
        '<div id="cancelSellBtn" class="menuBtn"></div>' +
        '<div id="confirmSellBtn" class="menuBtn"></div>');
    $('#questResults').show().transition({opacity: '1'}, 250);
    $('#cancelSellBtn').on('touchstart', function(){
        $('#questResults').animate({opacity: '0'}, 250,
            function () {
                $('#questResults').hide();
                $('#questResults .menu').html('<p class="title"></p>');
            });
    });
    $('#confirmSellBtn').on('touchstart', function(){
        $("#equipButton").unbind('touchstart')
            .css('filter', 'grayscale(1)');
        $("#sellStuffButton").unbind('touchstart')
            .css('filter', 'grayscale(1)');
        $('#questResults').animate({opacity: '0'}, 250,
            function () {
                $('#questResults').hide();
                $('#questResults .menu').html('<p class="title"></p>');
            });
        $.ajax({
            url: apiAddress + "api/sell/" + JSON.parse(localStorage.getItem('userHero'))['reserve'][
                Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[id.substr(-1)]]['id'],
            dataType: 'json',
            headers: {
                'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
                'Content-Type':'application/json'
            },
            method: 'POST',
            statusCode: {
                401: function () {
                    checkLogin().done(function(){
                        sellStuff(id);
                    });
                }
            }
        }).success(function(data ) {
            window.localStorage.setItem('userHero', JSON.stringify(data));
            initUi();
            backToStats();
            initAppearance();
            $("#equipButton").on('touchstart', function(){
                equipStuff($(this).attr('datasrc'));
            }).css('filter', '');
            $("#sellStuffButton").on('touchstart', function(){
                sellStuff($(this).attr('datasrc'));
            }).css('filter', '');
        });
    });
}
function panoInfo(id){
    if($('#equipButton').is(":hidden")){
        stuffDetails(id)
        return;
    }
    let stuff = $('#'+id);
    if(stuff.css('background-image') !== 'none') {
        let stuffSet = (id.substr(0, 7) === 'reserve' ?
            JSON.parse(window.localStorage.getItem('userHero'))['reserve'][Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[id.substr(-1)]] :
            JSON.parse(window.localStorage.getItem('userHero'))[id.substr(0, id.length - 5)])['template']['set'];
        $('#stuffName').text(stuffSet['name']);
        $('#equipButton').hide();
        $('#stuffStatsList').html("<div class='panoDesc'>"+stuffSet['desc']+"</div>");
        $('#panoInfoButton').css("background-image","url(img/ui/btn_cross_blue.png)");
    }
}
function equipStuff(id){
    $("#equipButton").unbind('touchstart')
        .css('filter', 'grayscale(1)');
    $("#sellStuffButton").unbind('touchstart')
        .css('filter', 'grayscale(1)');
    let url = apiAddress+"api/unequip/"+id.substr(0, id.length-5);

    if(id.substr(0, 7) === 'reserve')
        url = apiAddress + "api/equip/" + JSON.parse(localStorage.getItem('userHero'))['reserve'][
            Object.keys(JSON.parse(localStorage.getItem('userHero'))['reserve'])[id.substr(-1)]]['id'];

    $.ajax({
        url: url,
        dataType: 'json',
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        },
        method: 'POST',
        statusCode: {
            401: function () {
                checkLogin().done(function(){
                    equipStuff(id);
                });
            }
        }
    }).success(function(data ) {
        window.localStorage.setItem('userHero', JSON.stringify(data));
        initAppearance();
        $("#equipButton").on('touchstart', function(){
            equipStuff($(this).attr('datasrc'));
        }).css('filter', '');
        $("#sellStuffButton").on('touchstart', function(){
            sellStuff($(this).attr('datasrc'));
        }).css('filter', '');
        initStats();
        backToStats();
    });
}
function regenLadder() {
    $.ajax({
        url: apiAddress+"api/ladder",
        method: 'POST',
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        }
    })
        .done(function( data ) {
            data.forEach(function(hero, index){
                $('#ladder').append('<tr><td>'+(index+1)+'</td><td>'+hero.name+'</td><td>'+hero.level+'</td></tr>')
            })
        });
}
function buyChest(nb) {
    let hero = JSON.parse(localStorage.getItem('userHero'));
    let price = $('.shopItem:eq('+nb+') .price');
    if(price.hasClass('cristal') && hero.cristal < price.text()){
        popError('Cristaux insuffisants.');
        return;
    }
    if(price.hasClass('coin') && hero.gold < price.text()){
        popError('Pièces insuffisantes.');
        return;
    }
    if(JSON.parse(localStorage.getItem('userHero')).reserve.length >= 5){
        popError('Réserve pleine.');
        return;
    }
    $('.shopItem:eq('+nb+') .shopChest').clone().css({
        marginTop: '200px',
        marginLeft: 'auto',
        marginRight: 'auto',
    }).appendTo('#chestScreen');
    $('#chestScreen').css('display', 'block').transition({ opacity: 1 }, 500, 'ease')
        .append('<div class="effect"></div>');
    $('#chestScreen .effect').transition({ scaleY: 0, x: '-50%' }, 1);
    const chestAnimation = new Promise(function(resolve, reject) {
        setTimeout(function () {
            $('#chestScreen .shopChest').transition({filter: 'brightness(3000%)'}, 1000, 'ease');
            $('#chestScreen').transition({backgroundColor: '#ffffff'}, 2000, 'ease');
            $('#chestScreen .effect').transition({scaleY: 1.3, scaleX: 1.3}, 2000, 'ease');
            setTimeout(function () {
                resolve('ok');
            }, 2000);
        }, 1000);
    });
    $.ajax({
        url: apiAddress+"api/buyChest/"+nb,
        method: 'POST',
        headers: {
            'Authorization':'Bearer '+JSON.parse(window.localStorage.getItem('appToken'))['token'],
            'Content-Type':'application/json'
        }
    }).success(function( data ) {
        chestAnimation.then(function(res){
            window.localStorage.setItem('userHero', JSON.stringify(data));
            let item = data.reserve[data.reserve.length-1];
            let type = item.template.type.name;
            let relativeStuff =  $('#'+type.toLowerCase()+'Stuff');
            let shadows = generateShadowsRarity(item.template.rarity);
            $('#chestResults .title').append(item.template.name).css({textShadow: shadows[1]});
            $('#chestResults .menu .image').css({
                backgroundImage: 'url(img/equipment/' + (type!=='Weapon'&&type!=='Helmet'?'Stuffs':type) + '/' + item.template.image + ')',
                backgroundPosition: relativeStuff.css('background-position'),
                backgroundSize: relativeStuff.css('background-size'),
                boxShadow: shadows[0]
            }).html('');
            if(type === 'Hands'){
                $('#handsStuff .hoverStuff').clone()
                    .css({
                        backgroundImage: 'url(img/equipment/Stuffs/' + item.template.image + ')',
                        width: '60px',
                        height: '60px',
                        backgroundOrigin: 'content-box',
                        padding: '20px'
                    })
                    .appendTo('#chestResults .menu .image');
            }
            if(item.damages.length > 0){
                $('#weaponStats').clone().attr('id', 'weaponStatsReward').appendTo('#chestResults .stats');
                $('#chestResults .stats .punchIcon').removeClass().addClass('iconQuest punchIcon element'+item.element.id);
                $('#chestResults .stats #statsHeroWeapon').text(item.damages[0] + ' - ' + item.damages[1]);
            }
            item.stats.forEach(function (val, index) {
                if(val > 0){
                    $('#chestResults .stats').append('<div class="stuffStat"><span class="iconStats element'+(index+1)+'"></span><span>'+val+'</span></div>')
                }
            });
            $('#chestResults .menu').append('<div id="validateChestBtn" class="menuBtn"></div>');
            $('#validateChestBtn').on('touchstart', function () {
                $('#chestResults').animate({opacity: '0'}, 750,
                    function () {
                        $('#chestResults').hide();
                        $('#chestResults .menu').html('<p class="title"></p><div class="image"></div><div class="stats"></div>');
                    });
            });
            $('#chestResults').show().css('opacity', 1);
            initUi();
            renderStuff();
            $('#chestScreen .shopChest').transition({ opacity: 0 }, 500, 'ease');
            $('#chestScreen').transition({ opacity: 0 }, 500, 'ease');
            $('#chestScreen .effect').transition({ opacity: 0 }, 500, 'ease');
            setTimeout(function () {
                $('#chestScreen').html('').attr('style', '');
            }, 500);
        });
    }).error(function(e){
        chestAnimation.then(function(res){
            popError(e.responseJSON.detail);
            $('#chestScreen .shopChest').transition({ opacity: 0 }, 500, 'ease');
            $('#chestScreen').transition({ opacity: 0 }, 500, 'ease');
            $('#chestScreen .effect').transition({ opacity: 0 }, 500, 'ease');
            setTimeout(function () {
                $('#chestScreen').html('').attr('style', '');
            }, 500);
        });
    });
}
function generateShadowsRarity(rarity){
    let shadowBox = '';
    let shadowName = '';
    switch (rarity) {
        case "0":
            shadowBox = '0 0 4vw rgb(161, 161, 161) inset';
            shadowName = 'rgb(161, 161, 161) 2px 0px 0px, rgb(161, 161, 161) 1.75517px 0.958851px 0px, rgb(161, 161, 161) 1.0806px 1.68294px 0px, rgb(161, 161, 161) 0.141474px 1.99499px 0px, rgb(161, 161, 161) -0.832294px 1.81859px 0px, rgb(161, 161, 161) -1.60229px 1.19694px 0px, rgb(161, 161, 161) -1.97998px 0.28224px 0px, rgb(161, 161, 161) -1.87291px -0.701566px 0px, rgb(161, 161, 161) -1.30729px -1.5136px 0px, rgb(161, 161, 161) -0.421592px -1.95506px 0px, rgb(161, 161, 161) 0.567324px -1.91785px 0px, rgb(161, 161, 161) 1.41734px -1.41108px 0px, rgb(161, 161, 161) 1.92034px -0.558831px 0px';
            break;
        case "1":
            shadowBox = '0 0 6vw rgb(87, 141, 222) inset';
            shadowName = 'rgb(87, 141, 222) 2px 0px 0px, rgb(87, 141, 222) 1.75517px 0.958851px 0px, rgb(87, 141, 222) 1.0806px 1.68294px 0px, rgb(87, 141, 222) 0.141474px 1.99499px 0px, rgb(87, 141, 222) -0.832294px 1.81859px 0px, rgb(87, 141, 222) -1.60229px 1.19694px 0px, rgb(87, 141, 222) -1.97998px 0.28224px 0px, rgb(87, 141, 222) -1.87291px -0.701566px 0px, rgb(87, 141, 222) -1.30729px -1.5136px 0px, rgb(87, 141, 222) -0.421592px -1.95506px 0px, rgb(87, 141, 222) 0.567324px -1.91785px 0px, rgb(87, 141, 222) 1.41734px -1.41108px 0px, rgb(87, 141, 222) 1.92034px -0.558831px 0px';
            break;
        case "2":
            shadowBox = '0 0 8vw rgb(184, 74, 212) inset';
            shadowName = 'rgb(184, 74, 212) 2px 0px 0px, rgb(184, 74, 212) 1.75517px 0.958851px 0px, rgb(184, 74, 212) 1.0806px 1.68294px 0px, rgb(184, 74, 212) 0.141474px 1.99499px 0px, rgb(184, 74, 212) -0.832294px 1.81859px 0px, rgb(184, 74, 212) -1.60229px 1.19694px 0px, rgb(184, 74, 212) -1.97998px 0.28224px 0px, rgb(184, 74, 212) -1.87291px -0.701566px 0px, rgb(184, 74, 212) -1.30729px -1.5136px 0px, rgb(184, 74, 212) -0.421592px -1.95506px 0px, rgb(184, 74, 212) 0.567324px -1.91785px 0px, rgb(184, 74, 212) 1.41734px -1.41108px 0px, rgb(184, 74, 212) 1.92034px -0.558831px 0px';
            break;
        case "3":
            shadowBox = '0 0 10vw rgb(213, 173, 47) inset';
            shadowName = 'rgb(213, 173, 47) 2px 0px 0px, rgb(213, 173, 47) 1.75517px 0.958851px 0px, rgb(213, 173, 47) 1.0806px 1.68294px 0px, rgb(213, 173, 47) 0.141474px 1.99499px 0px, rgb(213, 173, 47) -0.832294px 1.81859px 0px, rgb(213, 173, 47) -1.60229px 1.19694px 0px, rgb(213, 173, 47) -1.97998px 0.28224px 0px, rgb(213, 173, 47) -1.87291px -0.701566px 0px, rgb(213, 173, 47) -1.30729px -1.5136px 0px, rgb(213, 173, 47) -0.421592px -1.95506px 0px, rgb(213, 173, 47) 0.567324px -1.91785px 0px, rgb(213, 173, 47) 1.41734px -1.41108px 0px, rgb(213, 173, 47) 1.92034px -0.558831px 0px';
            break;
    }
    return [shadowBox, shadowName];
}
function popError(message){
    $('.flashError').show().html('<p>'+message+'</p>')
        .transition({marginTop: '4px'}, 500)
        .transition({marginTop: '4px'}, 5000)
        .transition({marginTop: '-'+$('.flashError').css('height')}, 500, 'ease', function () {
            $(this).hide().html('')
        });
}
function toggleTooltip(margins, html) {
    $("#tooltip").show();
    $("#tooltip .inner-tooltip")
        .attr('style', '')
        .css(margins)
        .html(html);
}
function tooltipXp() {
    let data = JSON.parse(window.localStorage.getItem('userHero'));
    let xp = data.experience;
    let xpMax = Math.round(10*Math.pow(data.level, 1.6));
    let pourcentage = Math.round((xp/xpMax)*100);
    toggleTooltip({top: '40px', left: '8px'}, '<p>Experience:</p><p><span class="important">'+pourcentage+'%</span> ('+xp+' / '+xpMax+')</p>');
}
function tooltipStats() {
    let data = JSON.parse(window.localStorage.getItem('userHero'));
    let xp = data.experience;
    let xpMax = Math.round(10*Math.pow(data.level, 1.6));
    let pourcentage = Math.round((xp/xpMax)*100);
    toggleTooltip({top: '40px', left: '8px'}, '<p>Experience:</p><p><span class="important">'+pourcentage+'%</span> ('+xp+' / '+xpMax+')</p>');
}