function init(eventid) {
    populate_events();
    if (eventid){
        if (!FD){ FD=initialize_FD(); } else { clear_fd(); }
        var statusarray=$("#statusselection").val();

        var eventquery = FB.Data.query(
        'select uid from event_member ' +
        'where rsvp_status in (' + statusarray  + ')' +
            'and eid = ' + eventid );

        var userquery = FB.Data.query(
        'select uid, name, pic_small from user ' +
        'where uid in  ' +
            ' (select uid from {0})', eventquery);

        return get_data_from_queries(eventquery, userquery);
    }
};

// If not defined sendAsBinary, we define it, thanks to http://stackoverflow.com/questions/5292689/sending-images-from-canvas-elements-using-ajax-and-php-files
// Also function postCanvasToURL got from there
if (XMLHttpRequest.prototype.sendAsBinary === undefined) {
  XMLHttpRequest.prototype.sendAsBinary = function(string) {
    var bytes = Array.prototype.map.call(string, function(c) {
      return c.charCodeAt(0) & 0xff;
    });
    this.send(new Uint8Array(bytes).buffer);
  };
}

function canvasToFacebook(canvasid){ blobToFacebook(canvasURItoBlob(document.getElementById(canvasid))); }
function blobToFacebook(data){
    // We send the form data trought ajax. INCLUDING THE FILE! FINALLY!
    // Note this seems to not be working for some reason.
    // This should work. It doesnt. 
    // Looks like formData does not work at all.
    var params = {};
    params['message'] = 'Screen from graph event friends';
    params['source'] = data;
    params['upload_file'] = true;
    params['upload file'] = true;
    params['access_token'] = access_token;

    
    var fd     = new FormData();
    var http   = new XMLHttpRequest();
/*
    http.open("POST", "http://graph.facebook.com/me/photo/", true);
    http.setRequestHeader("Content-type", "multipart/form-data");
    http.setRequestHeader("Content-length", params.length);
    http.setRequestHeader("Connection", "close");
    http.onreadystatechange = function() { if(http.readyState == 4 && http.status != 0 ) {alert(http.status); } }
*/
    for ( key in params ){fd.append(key, params[key]); }
    FB.api('/me/photos', 'post', {
        message:params['message'],
        source: fd
    }, function(response){
            console.log(response);
    });
  //  http.send(fd);
}

function canvasURItoBlob(canvas) {
    // Converts a canvas uri to Blob of File, so we can send it with FormData. =)
    if ( ! window.WebKitBlobBuilder && typeof XMLHttpRequest.prototype.sendAsBinary == "function") { // not chrome
        data = canvas.mozGetAsFile("foo.png");
    } else {
        dataURI=canvas.toDataURL();
        var byteString;
        if (dataURI.split(',')[0].indexOf('base64') >= 0){
            byteString = atob(dataURI.split(',')[1]);
        } else {
            byteString = unescape(dataURI.split(',')[1]);
        }

    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {  ia[i] = byteString.charCodeAt(i);  }
        if (window.BlobBuilder) {
            bb = new BlobBuilder();
        } else if (window.WebKitBlobBuilder) {
            bb = new WebKitBlobBuilder();
        }
        bb.append(ab);
        blob = bb.getBlob();
        data=bb.getBlob(mimeString);
    }

    return data;
}

function populate_events(){
    eventsa=[];
    FB.api('/me/events', function(response) {
        for (var a in response.data) { 
            eventsa.push( 
                {
                    text: response.data[a].name, 
                    url: response.data[a].id
                }
            );
            $('#eventchooser').append("<option value='" +  response.data[a].id + "' >" + response.data[a].name + "</option>");
        }

        $('#eventid_').autocomplete(eventsa, {formatItem: function(item) { return item.text;  }}).result(function(event, item) {
            $('#eventid').val(item.url);
            cargaevento(item.url);
            window.location.hash="fri";
        });

    });
}

function get_data_from_queries(eventquery,userquery){
    uids=[];

    FB.Data.waitOn([eventquery, userquery],
        function () {
            userdata = _.reduce(userquery.value,
                function (memo, row) {
                    memo[row.uid] = [row.name, row.pic_small];
                    uids.push(row.uid)
                    return memo;
                 }, {});

            limit=document.getElementById('limit').value;
            uids=uids.slice(0, limit);

            var uidstring = uids.join(",");
            var querywaits= FB.Array.map(uids, function(uid) {
                var friendquery = FB.Data.query(
                    'select uid1, uid2 from friend ' +
                    'where uid1 in ({1}) and uid2 in ({0})'
                    ,uidstring, uid );

                friendquery.wait( function (pares) {
                    if ( pares.length != 0 ) { 

                        $('div#friends').queue( function(next) {
                            FB.Array.forEach(pares, function (par) {
                                if (!FD.graph.hasNode(par.uid1)) {
                                    FD.graph.addNode({id: par.uid1, name:""+par.uid1});
                                };

                                if (!FD.graph.hasNode(par.uid2)) {
                                    FD.graph.addNode({id: par.uid2, name:""+par.uid2});
                                };

                                FD.graph.addAdjacence(FD.graph.getNode(par.uid1),
                                    FD.graph.getNode(par.uid2), null);

                                FD.root=par.uid1;
                            });

                        //FD.compute();
                        FD.refresh();
                        FB.XFBML.parse(document.getElementById('friends'))   
                            setTimeout(next,0); //metemos todo en la cola de efectos
                        }); //.queue  

                    };
                }); //wait
            });
            return userdata
     }); //de waitOn
}
