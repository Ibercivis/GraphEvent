var norenderface;
var norendertext;
var idnorenderface={};
var idnorendertext={};
var main_url="http://155.210.136.25:8080/~dfrancos/";

$jit.ForceDirected.Plot.NodeTypes.implement({
         'face': {
          'render': function(node, canvas) {
              node.face = new Image();
              node.Label=userdata[node.id][0]
              url = userdata[node.id][1];
              dim = node.getData('dim');
              var ctx = canvas.getCtx();
              var width="100", height="100", pos=node.pos.getc(true); // TODO Change width/height.
              if (!idnorendertext[node.id]){ idnorendertext[node.id]=false; }
              if (!idnorenderface[node.id]){ idnorenderface[node.id]=false; }
              if (!norendertext && !idnorendertext[node.id] ){ ctx.fillText(userdata[node.id][0],pos.x-10,pos.y-20); }
              if (!norenderface && !idnorenderface[node.id] ){ node.face.src = main_url + "/proxy.php?mode=native&url=" + url;}
              else { node.face.src=main_url + "/images/defaultface.png"; }
              ctx.drawImage(node.face,pos.x-30,pos.y-40);
          },
        },
    });

function initialize_FD(){
    var FD = new $jit.ForceDirected({ 
          injectInto: 'friends',
          iterations:10,
          levelDistance: 60,

          Node: {
            'transform': false,
             color: "#f00",
            type:'face',
          },

          Edge: {
             color: "#088",
             lineWidth: 0.7
          },

          // Add node events
          Events: {
                enable: true,
                type: 'Native',

                onMouseEnter: function() { //Change cursor style when hovering a node
                    FD.canvas.getElement().style.cursor = 'move';
                },
                onMouseLeave: function() {
                    FD.canvas.getElement().style.cursor = '';
                },
    
                onDragMove: function(node, eventInfo, e) { //Update node positions when dragged
                    var pos = eventInfo.getPos();
                    node.pos.setc(pos.x, pos.y);
                    FD.plot();
                },

                onTouchMove: function(node, eventInfo, e) { //Implement the same handler for touchscreens
                    $jit.util.event.stop(e); //stop default touchmove event
                    this.onDragMove(node, eventInfo, e);
                }
          },

          Navigation: {
            enable: true,
            panning: 'avoid nodes',  //Enable panning events only if we're dragging the empty  canvas (and not a node).  
            zooming: 100 //zoom speed. higher is more sensible  
          },

          onCreateLabel: function (domElement, node) {
              AddAdvancedPrivacyEntry(node.id); // Add the user to advanced privacy options menu
              SetNodePicture(node);
//             SetNodeDefaultPicture(node); // Default picture if it's been selected to not show it
          },

          onPlaceLabel: function (domElement, node) {
              var width = domElement.offsetWidth;
              var intX = parseInt(domElement.style.left);
              intX -= width / 2;
              domElement.style.left = intX + 'px';
          }
    });

    return FD;
}

function extracompute() {
    FD.config.iterations=50;
    FD.refresh();
    if ($('input[name=sigue]').attr('checked')) {setTimeout( extracompute,0);} ;
};

function clear_fd() {
  FD.graph.empty();
  FD.canvas.clear();
  document.getElementById(FD.canvas.id + "-label").innerHTML="";
}

function get_node(id){  return FD.graph.nodes[id]; }



function hide_nodes(status_, id){
    n=get_node(id)
    switch (status_){
        case "pic": norenderface=(norenderface==true) ? false : true; break;
        case "txt": norendertext=(norendertext==true) ? false : true; break;
    }
}

function hide_node(status_, id){
    n=get_node(id)
    switch (status_){
        case "pic": idnorenderface[id]=(idnorenderface[id]==false) ? true : false; break;
        case "txt": idnorendertext[id]=(idnorendertext[id]==false) ? true : false; break;
    }
}

