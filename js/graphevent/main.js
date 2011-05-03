// remotamente basado en la demo nmdscript.js
// Usa thejit.org "InfoVis Toolkit"

var access_token, labelType, useGradients, nativeTextSupport, animate, FD;
userdata=[];

$('div#friends').css('height', '770px');
$('div#friends').css('width', '735px'); //758 no va! 750 tampoco, 730 a veces

$(function () {
    var ua = navigator.userAgent,
    iStuff = ua.match(/iPhone/i) || ua.match(/iPad/i),
    typeOfCanvas = typeof HTMLCanvasElement,
    nativeCanvasSupport = (typeOfCanvas == 'object' || typeOfCanvas == 'function'),
    textSupport = nativeCanvasSupport 
      && (typeof document.createElement('canvas').getContext('2d').fillText == 'function');
      //I'm setting this based on the fact that ExCanvas provides text support for IE
      //and that as of today iPhone/iPad current text support is lame
    labelType = (!nativeCanvasSupport || (textSupport && !iStuff))? 'Native' : 'HTML';
    nativeTextSupport = labelType == 'Native';
    useGradients = nativeCanvasSupport;
    animate = !(iStuff || !nativeCanvasSupport);

    FB.init({
        appId: '196714100359993',
        status: true,
        cookie: true,
        xfbml: true
    });



    FB.getLoginStatus(function(response) {
         switch (response.status){
            case "connected":
                 $('#container').css('display','block');
                 access_token=response.session.access_token;
                 init();
                 break;
            case "notConnected":
                top.location.href='https://www.facebook.com/dialog/oauth?client_id=196714100359993&redirect_uri=http://apps.facebook.com/graphevent&scope=user_events,friends_events,publish_stream';
                break;
            case "unknown":
                $('#loginadvice').css('display','block');
                break;
        }
    });
});

function cargaevento(eventi) {
    $('#paginated').empty();
    $('#paginated').css('display','block');
    $('#paginatederror').css('display','none');
    if (eventi) { init(eventi); }
};

function SetNodeDefaultPicture(node){
     if (document.getElementById('pictures').checked == true ){
        if (document.getElementById('p' + node.id).checked == true ){
            node.face.src="images/defaultface.png"; 
        }
     } else {
        if ( document.getElementById('p' + node.id).checked == false ){
            node.face.src="images/defaultface.png";
        }
     }
}

function individual_inversion(class_){ if ($('.' + class_).checked == 1){ $('.'+class_).checked=0; } else { $('.' + class_).checked=1; } }
function SetNodePicture(node){ node.face.src=userdata[node.id][1]; }
function hideAllNames(){ for (node in FD.graph.nodes) { hide_nodes('txt', node ); }; }
function hideAllPictures(){ for (node in FD.graph.nodes) { hide_nodes('pic', node ); }; }

function AddAdvancedPrivacyEntry(id){
    $('#paginated').append(
        '<div class="hider">'+
            '<p class="paginaed " style="display:inline" >' + userdata[id][0] + ' </p>' +
            '<p class="paginaed" style="display:inline">Show image '+
            "<input onclick=\"hide_node('pic',this.id.substr(1)); FD.refresh();\" value='id' class='apicture' id='p" + id + "' type='checkbox'/></p>" +
            '<p class="paginaed" style="display:inline">Show name' +
            "<input onclick=\"hide_node('txt',this.id.substr(1)); FD.refresh();\" value='id' class='aname' id='l" + id + "' type='checkbox'/></p>" +
        '</div>');
}
