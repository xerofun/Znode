function NodeGraph(){
  var win = $(window);
  var canvas = $("#canvas");
  var overlay = $("#overlay");
  var currentNode;
  var currentConnection = {};
  var connections = {};
  var connectionId = 0;
  var newNode;
  var nodes = {};
  var nodeId = 0;
  var mouseX = 0, mouseY = 0;
  var loops = [];
  var pathEnd = {};
  var zindex = 1;
  var hitConnect;
  var key = {};
  var SHIFT = 16;
  var topHeight = $("#controls").height();
  var scrollBarHeight = $('.scroll-bar-wrap').height();
  
  var associationBtn = $('#association');
  var compositionBtn = $('#composition');
  var inheritanceBtn = $('#inheritance');
  
  var currentConnectionType = "Association";
  
  var MIN_NODE_SIZE = 20;
  var MAX_NODE_SIZE = 1600;
  
  
  associationBtn.click(
    function()
    {
        // Set connector type
        currentConnectionType = "Association";
        
        // Clear old current connector type
        compositionBtn.removeClass('currentConnectorStyle');
        inheritanceBtn.removeClass('currentConnectorStyle');
        
        // Add current connector type to association button
        associationBtn.addClass('currentConnectorStyle');
    }
  );
  
  compositionBtn.click(
    function()
    {
        // Set connector type
        currentConnectionType = "Composition";
        
        // Clear old current connector type
        associationBtn.removeClass('currentConnectorStyle');
        inheritanceBtn.removeClass('currentConnectorStyle');
        
        // Add current connector type to association button
        compositionBtn.addClass('currentConnectorStyle');
    }
  );
  
  inheritanceBtn.click(
  function()
  {
      // Set connector type
      currentConnectionType = "Inheritance";
      
      // Clear old current connector type
      compositionBtn.removeClass('currentConnectorStyle');
      associationBtn.removeClass('currentConnectorStyle');
        
      // Add current connector type to association button
      inheritanceBtn.addClass('currentConnectorStyle');
    }
  );
  
  var resizerWidth = 10;
  
  var paper = new Raphael("canvas", "100", "100");
  
  function resizePaper(){
    paper.setSize(canvas.width(), win.height() - topHeight - scrollBarHeight);
  }
  win.resize(resizePaper);
  resizePaper();
  
  canvas.append("<ul id='menu'><li>Left<\/li><li>Right<\/li><li>Top<\/li><li>Bottom<\/li><\/ul>");
  var menu = $("#menu");
  menu.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 5000, "border" : "1px solid gray", "padding" : 0});
  menu.hide();
  
  canvas.append("<div id='hit' />");
  hitConnect = $("#hit");
  hitConnect.css({"position" : "absolute", "left" : 100, "top" : 0, "z-index" : 4000, "border" : "none", 
                  "width" : 10, "height": 10, "cursor":"pointer", "font-size": "1px"});
                  
  $("#menu li").hover(function(){
    $(this).css("background-color", "#cccccc");
  },
  function(){
    $(this).css("background-color", "white");
  }).click(function(){
    menu.hide();
    var dir = $(this).text();
    connectNode(dir);
  });
  
  function connectNode(dir){
    var node, x, y;
    dir = dir.toLowerCase();
    
    if (dir == "left"){
      x = pathEnd.x + 5;
      y = pathEnd.y - currentNode.height() / 2;
    }else if (dir == "right"){
      x = pathEnd.x - currentNode.width() - 5;
      y = pathEnd.y - currentNode.height() / 2;
    }else if (dir == "top"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y + 5;
    }else if (dir == "bottom"){
      x = pathEnd.x - currentNode.width() / 2;
      y = pathEnd.y - 5 - currentNode.height();
    }
    
 
    node = new Node(x, y, currentNode.width(), currentNode.height());
    saveConnection(node, dir, currentConnectionType);
    currentNode = node;
  }
  
  function createConnection(a, conA, b, conB, connectionType){ 
      var link = paper.path("M 0 0 L 1 1");
      link.attr({"stroke-width":2});
      link.parent = a[conA];
      
      a.addConnection(link);
      currentConnection = link;
      currentNode = a;

      saveConnection(b, conB, connectionType);
  }
  
  function saveConnection(node, dir, connectionType){
    if (!currentConnection) return;
    if (!currentConnection.parent) return;
    
    currentConnection.startNode = currentNode;
    currentConnection.endNode = node;
    currentConnection.startConnection = currentConnection.parent;
    currentConnection.endConnection = node[dir.toLowerCase()];
    
    if (!currentConnection.connectionType)
    {
      currentConnection.connectionType = connectionType;
    }
    
    currentConnection.id = connectionId;
    connections[connectionId] = currentConnection;
    connectionId++;
    
    currentNode.updateConnections();
    node.addConnection(currentConnection);
    
    $(currentConnection.node).mouseenter(function(){
      this.raphael.attr("stroke","#FF0000");
    }).mouseleave(function(){
      this.raphael.attr("stroke","#000000");
    }).click(function(){
      if (confirm("Are you sure you want to delete this connection?")){
        this.raphael.remove();
        delete connections[this.raphael.id];
      }
    });
  }
  
  canvas.mousedown(function(e){
    if (menu.css("display") == "block"){
      if (e.target.tagName != "LI"){
        menu.hide();
        currentConnection.remove();
      }
    }
  });
  
  $(document).keydown(function(e){
    key[e.keyCode] = true;
  }).keyup(function(e){
    key[e.keyCode] = false;
  });
  
  $(document).mousemove(function(e){
    mouseX = e.pageX;
    mouseY = e.pageY - topHeight;
  }).mouseup(function(e){
    overlay.hide();
    var creatingNewNode = newNode;
    
    hitConnect.css({"left":mouseX - 5 - parseInt(canvas.css('margin-left'), 10), "top":mouseY - 5});
    for (var i in nodes){
      if (nodes[i]){
        var n = nodes[i];
        if (n != currentNode){
          var nLoc = n.content.position();
          if (hitTest(toGlobal(nLoc, n.left), hitConnect)){
            saveConnection(n, "left", currentConnectionType);
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.top), hitConnect)){
            saveConnection(n, "top", currentConnectionType);
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.right), hitConnect)){
            saveConnection(n, "right", currentConnectionType);
            newNode = false;
            break;
          }else if (hitTest(toGlobal(nLoc, n.bottom), hitConnect)){
            saveConnection(n, "bottom", currentConnectionType);
            newNode = false;
            break;
          }
        }
      }
    }
    hitConnect.css("left", "-100px");
    
    if (newNode){
      if (key[SHIFT]){
        menu.css({"left":mouseX - 10, "top":mouseY});
        menu.show();
      }else{
        var dir;
        var currDir = currentConnection.parent.attr("class");
        if (currDir == "left"){
          dir = "right";
        }else if (currDir == "right"){
          dir = "left";
        }else if (currDir == "top"){
          dir = "bottom";
        }else if (currDir == "bottom"){
          dir = "top";
        }
        
        if (pathEnd.x == undefined || pathEnd.y == undefined){
          currentConnection.remove();
        }else{
          connectNode(dir);
        }
      }
    }
    newNode = false;
    
    for (var i in loops){
      clearInterval(loops[i]);
    }
    try{
      if (loops.length > 0) document.selection.empty();
    }catch(e){}
    loops = [];
    
    if (creatingNewNode) currentNode.txt[0].focus();
  });
  
  function toGlobal(np, c){
    var l = c.position();
    return {position : function(){ return {left: l.left + np.left, top : l.top + np.top}; },
            width : function(){ return c.width(); },
            height : function(){ return c.height(); }};
  }
  
  function showOverlay(){
    overlay.show();
    overlay.css({"width" : win.width(), "height" : win.height()}); //, "opacity": 0.1});
  }
  
  function startDrag(element, bounds, dragCallback){
    showOverlay();
    var startX = mouseX - element.position().left;
    var startY = mouseY - element.position().top;
    if (!dragCallback) dragCallback = function(){};
      var id = setInterval(function(){
      var x = mouseX - startX;
      var y = mouseY - startY;
      if (bounds){
        if (x < bounds.left) x = bounds.left;
        if (x > bounds.right) x = bounds.right;
        if (y < bounds.top) y = bounds.top;
        if (y > bounds.bottom) y = bounds.bottom;
      }
      element.css("left", x).css("top",y);
      dragCallback();
    },topHeight);
    loops.push(id);
  }
  
 
  /**
   * Returns a path object that represents a composition connection from
   * x1,y1 to x2,y2
   */
  function moveCompositionPath(path, x1, y1, x2, y2)
  {
    // TODO: Make this globally accessible?
    size = 10;
    
    // Total distance from point to point
    lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    var angle = Math.atan2(x1-x2,y2-y1);
    angle = (angle / (2 * Math.PI)) * 360;
    
    path.attr("path",    "M" + x2 + " " + y2 + 
                        " L" + (x2 - size) + " " + (y2 - size) + 
                        " L" + (x2 - 2 * size) + " " + y2 +
                        " L" + (x2 - size) + " " + (y2 + size) + 
                        " L" + x2 + " " + y2 +
                        " M" + (x2 - 2 * size) + " " + y2 +
                        " L" + (x2 - lineLength) + " " + y2 +
                        " L" + (x2 - lineLength + size) + " " + (y2 - size) +
                        " M" + (x2 - lineLength) + " " + y2 +
                        " L" + (x2 - lineLength + size) + " " + (y2 + size)).rotate((90+angle),x2,y2);
  }
  
  
  /**
   * Returns a path object that represents an inheritance connection from
   * x1,y1 to x2,y2
   */
  function moveInheritancePath(path, x1, y1, x2, y2)
  {
    // TODO: Make this globally accessible?
    size = 10;
    
    // Total distance from point to point
    lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    // Coordinates of where to stop drawing the line
    xIntersect = x2 - (size * (Math.sqrt(3) / 2));
    
    var angle = Math.atan2(x1-x2,y2-y1);
    angle = (angle / (2 * Math.PI)) * 360;
    
    path.attr("path",   "M" + x2 + " " + y2 +
                       " L" + (x2 - size) + " " + (y2 - size) + 
                       " L" + (x2 - size) + " " + (y2 + size) + 
                       " L" + x2 + " " + y2 + 
                       " M" + xIntersect + " " + y2 +                       
                       " L" + (x2 - lineLength) + " " + y2).rotate((90+angle),x2,y2);
  }
  
  /**
   * Returns a path object that represents an inheritance connection from
   * x1,y1 to x2,y2
   */
  function moveAssociationPath(path, x1, y1, x2, y2)
  {
    // Total distance from point to point
    lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
   
    var angle = Math.atan2(x1-x2,y2-y1);
    angle = (angle / (2 * Math.PI)) * 360;
    
    path.attr("path",   "M" + x2 + " " + y2 +
                       " L" + (x2 - lineLength) + " " + y2).rotate((90+angle),x2,y2);
  }

  
  function Node(xp, yp, w, h, noDelete, forceId){
    
    if (forceId){
       nodeId = forceId;
    }
    this.id = nodeId;
    nodes[nodeId] = this;
    nodeId++;
    
    var curr = this;
    this.connections = {};
    var connectionIndex = 0;
    
    this.addConnection = function(c){
      curr.connections[connectionIndex++] = c;
      return c;
    }
    
    canvas.append("<div class='node'/>");
    var n = $(".node").last();
    n.css({"position" : "absolute",      
           "left" : xp, "top" : yp,
           "width" : w, "height" : h,   
           "border" : "1px solid gray",
           "background-color" : "white"});
    n.css("z-index", zindex++);
           
    this.content = n;
    
    this.width = function(){
      return n.width();
    }
    this.height = function(){
      return n.height();
    }
    this.x = function(){
      return n.position().left;
    }
    this.y = function(){
      return n.position().top;
    }
         
    var nodeWidth = n.width();
    var nodeHeight = n.height();
           
    n.append("<div class='bar'/>");
    var bar = $(".node .bar").last();
    bar.css({"height" : "10px", 
             "background-color" : "gray", 
             "padding" : "0", "margin": "0",
             "font-size" : "9px", "cursor" : "pointer"});
             
             
    if (!noDelete){
      n.append("<div class='ex'>X<\/div>");
      var ex = $(".node .ex").last();
      ex.css({"position":"absolute","padding-right" : 2, "padding-top" : 1, "padding-left" : 2,
              "color" : "white", "font-family" : "sans-serif",
              "top" : 0, "left": 0, "cursor": "pointer",
              "font-size" : "7px", "background-color" : "gray", "z-index" : 100});
      ex.hover(function(){
        ex.css("color","black");
      }, function(){
        ex.css("color","white");
      }).click(function(){
      
        if (confirm("Are you sure you want to delete this node?")){
          curr.remove();
        }
      });
    }
   
    n.append("<textarea class='txt' spellcheck='false' wrap='off' />");

    var txt = $(".node .txt").last();
    txt.css("position","absolute");
   
    txt.css({"width" : nodeWidth - 5 - (resizerWidth + 1),
             "height" : nodeHeight - bar.height() - 5,
             "margin-left" : (resizerWidth + 1),
             "resize" : "none", "overflow" : "scroll",
             "font-size" : "12px" , "font-family" : "sans-serif",
             "border" : "none","z-index":4});
          
    this.txt = txt;
    
    n.append("<textarea class='src' spellcheck='false' wrap='off' />");
    
    var src = $(".node .src").last();
    src.css("position","absolute");
    
    src.css({"width" : nodeWidth - 5 - (resizerWidth + 1),
             "height" : nodeHeight - bar.height() - 5,
             "margin-left" : (resizerWidth + 1),
             "resize" : "none",
             "overflow" : "scroll",
             "font-size" : "12px", "font-family" : "sans-serif",
             "border" : "none", "z-index" : -1});
             
    this.src = src;
    
    n.append("<div class='resizer' />");
    var resizer = $(".node .resizer").last();
    
    resizer.css({"position" : "absolute" , "z-index" : 10,
                 "width" : "10px", "height" : "10px",
                 "left" : nodeWidth - (resizerWidth + 1), 
                 "top" : nodeHeight - (resizerWidth + 1),
                 "background-color" : "white", "font-size" : "1px",
                 "border" : "1px solid gray",
                 "cursor" : "pointer"});
            
    // Add source button
    n.append("<div class='sourceBtn'>&hellip;<\/div>");
    var sourceButton = $(".node .sourceBtn").last();
    
    sourceButton.css({"position": "absolute",
                      "z-index": 10,
                      "width": "10px",
                      "height": "10px",
                      "left": "-1px",
                      "top": nodeHeight - (resizerWidth + 1),
                      "background-color": "white",
                      "font-size": "7px",
                      "border" : "1px solid gray",
                      "cursor": "pointer"});

    sourceButton.click(
        function(){
            // Swap z-indices of src and txt
            tmpZ = src.css("z-index");
            src.css({"z-index" : txt.css("z-index")});
            txt.css({"z-index" : tmpZ});
        });
    
    n.append("<div class='left'>");
    n.append("<div class='top'>");
    n.append("<div class='right'>");
    n.append("<div class='bottom'>");
    
    var left = $(".node .left").last();
    left.css("left","-11px");
    
    var top = $(".node .top").last();
    top.css("top","-11px");
    
    var right = $(".node .right").last();
    var bottom = $(".node .bottom").last();
    
    setupConnection(left);
    setupConnection(right);
    setupConnection(top);
    setupConnection(bottom);
    
    positionLeft();
    positionRight();
    positionTop();
    positionBottom();
    
    positionSourceButton();
    
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    
    function positionLeft(){
      left.css("top", n.height() / 2 - 5);
    }
    function positionRight(){
      right.css("left",n.width() + 1).css("top", n.height() / 2 - 5);
    }
    function positionTop(){
      top.css("left", n.width() / 2 - 5);
    }
    function positionBottom(){
      bottom.css("top",n.height() + 1).css("left", n.width() / 2 - 5);
    }
    
    // Update the position of the source button
    function positionSourceButton()
    {
        sourceButton.css("top", n.height() - (resizerWidth + 1));
    }
    
    function setupConnection(div){
      div.css({"position" : "absolute", "width" : "10px", "padding":0,
               "height" : "10px", "background-color" : "#aaaaaa",
               "font-size" : "1px", "cursor" : "pointer"});
    }
    
    this.connectionPos = function(conn){
      var loc = conn.position();
      var nLoc = n.position();
      var point = {};
      point.x = nLoc.left + loc.left + 5;
      point.y = nLoc.top + loc.top + 5;
      return point;
    }
    
    function updateConnections(){
       for (var i in curr.connections){
         var c = curr.connections[i];
         if (!c.removed){
           var nodeA = c.startNode.connectionPos(c.startConnection);
           var nodeB = c.endNode.connectionPos(c.endConnection);

           if (c.connectionType == 'Association')
           {
             moveAssociationPath(c, nodeA.x, nodeA.y, nodeB.x, nodeB.y);
           }
           else if (c.connectionType == 'Composition')
           {
             moveCompositionPath(c, nodeA.x, nodeA.y, nodeB.x, nodeB.y);
           }
           else if (c.connectionType == 'Inheritance')
           {
             moveInheritancePath(c, nodeA.x, nodeA.y, nodeB.x, nodeB.y);
           }
         }
       }
    }
    this.updateConnections = updateConnections;
    
    
   function addLink(e){
      currentNode = curr;
      e.preventDefault();
      showOverlay();
      var link = paper.path("M 0 0 L 1 1");
      link.attr({"stroke-width":2});
      currentConnection = link;
      currentConnection.parent = $(this);
      
      curr.addConnection(link);
      var loc = $(this).position();
      var nLoc = n.position();
      var x = loc.left + nLoc.left + 5;
      var y = loc.top + nLoc.top + 5;
      newNode = true;
      
      var id = setInterval(function(){
      
           if (currentConnectionType == 'Association')
           {
             moveAssociationPath(link, x, y, (mouseX - parseInt(canvas.css('margin-left'), 10)), mouseY);
           }
           else if (currentConnectionType == 'Composition')
           {
             moveCompositionPath(link, x, y, (mouseX - parseInt(canvas.css('margin-left'), 10)), mouseY);
           }
           else if (currentConnectionType == 'Inheritance')
           {
             moveInheritancePath(link, x, y, (mouseX - parseInt(canvas.css('margin-left'), 10)), mouseY);
           }
        
        pathEnd.x = mouseX - parseInt(canvas.css('margin-left'), 10);
        pathEnd.y = mouseY;
      }, 30);
      loops.push(id);
   }
   left.mousedown(addLink);
   right.mousedown(addLink);
   top.mousedown(addLink);
   bottom.mousedown(addLink);
   
   this.remove = function(){
     for (var i in curr.connections){
       var c = curr.connections[i];
       c.remove();
       delete connections[c.id];
       delete curr.connections[i];
     }
     n.remove();
     delete nodes[this.id];
   }
    
    resizer.mousedown(function(e){
      currentNode = curr;
      e.preventDefault();
      // TODO: Update max nodesize here
      startDrag(resizer, {left : MIN_NODE_SIZE, top : MIN_NODE_SIZE, right : MAX_NODE_SIZE, bottom : MAX_NODE_SIZE},
      function(){
        var loc = resizer.position();
        var x = loc.left;
        var y = loc.top;
        n.css({"width" : x + resizer.width() + 1,
               "height" : y + resizer.height() + 1});
        
        txt.css({"width" : n.width() - 5 - (resizerWidth + 1), "height" : n.height() - bar.height() - 5});
        src.css({"width" : n.width() - 5 - (resizerWidth + 1), "height" : n.height() - bar.height() - 5});
        
        positionLeft();
        positionRight();
        positionTop();
        positionBottom();
        
        positionSourceButton();
        
        updateConnections();
      });
    });
    
    bar.mousedown(function(e){
      currentNode = curr;
      n.css("z-index", zindex++);
      e.preventDefault();
      startDrag(n, {left : 10, top: 40, right : canvas.width() - n.width() - 10, bottom : win.height() - n.height() - 10},
      updateConnections);
    });
    
    n.mouseenter(function(){
      n.css("z-index", zindex++);
    });
    
  }
  
  function hitTest(a, b){
    var aPos = a.position();
    var bPos = b.position();
    
    var aLeft = aPos.left;
    var aRight = aPos.left + a.width();
    var aTop = aPos.top;
    var aBottom = aPos.top + a.height();
    
    var bLeft = bPos.left;
    var bRight = bPos.left + b.width();
    var bTop = bPos.top;
    var bBottom = bPos.top + b.height();
    
    // http://tekpool.wordpress.com/2006/10/11/rectangle-intersection-determine-if-two-given-rectangles-intersect-each-other-or-not/
    return !( bLeft > aRight
      || bRight < aLeft
      || bTop > aBottom
      || bBottom < aTop
      );
  }
  
  
 function clear(){
    nodeId = 0;
    connectionsId = 0;
    for (var i in nodes){
      nodes[i].remove();
    }
  }
  
  this.clearAll = function(){
    clear();
    defaultNode();
    currentConnection = null;
    currenNode = null;
  }
  
  this.addNode = function(x, y, w, h, noDelete){
    return new Node(x, y, w, h, noDelete);
  }
  
  var defaultWidth = 100;
  var defaultHeight = 50;
  
  this.addNodeAtMouse = function(){
    //alert("Zevan");
    var w = currentNode.width() || defaultWidth;
    var h = currentNode.height () || defaultHeight;
    var temp = new Node(mouseX - parseInt(canvas.css('margin-left'), 10), mouseY, w, h);
    currentNode = temp;
    currentConnection = null;
  }
  
  function defaultNode(){
    
    var temp = new Node(win.width() / 2 - defaultWidth / 2, 
                        win.height() / 2 - defaultHeight / 2,
                        defaultWidth, defaultHeight, true);
    temp.txt[0].focus();
    currentNode = temp;
  }
  defaultNode();

  this.fromJSON = function(data){
    clear();
    for (var i in data.nodes){
      var n = data.nodes[i];
      var ex = (i == "0") ? true : false;
      var temp = new Node(n.x, n.y, n.width, n.height, ex, n.id);
      temp.txt.val(n.txt);
      temp.src.val(n.src);
    }
    for (i in data.connections){
      var c = data.connections[i];
      createConnection(nodes[c.nodeA], c.conA, nodes[c.nodeB], c.conB, c.connectionType);
    }
  }
  
  this.toJSON = function(){
    var json = '{"nodes" : [';
    for (var i in nodes){
      var n = nodes[i];
      json += '{"id" : ' + n.id + ', ';
      json += '"x" : ' + n.x() + ', ';
      json += '"y" : ' + n.y() + ', ';
      json += '"width" : ' + n.width() + ', ';
      json += '"height" : ' + n.height() + ', ';
      json += '"txt" : "' + addSlashes(n.txt.val()) + '", ';
      json += '"src" : "' + addSlashes(n.src.val()) + '"},';
    }
    json = json.substr(0, json.length - 1);
    json += '], "connections" : [';
    
    var hasConnections = false;
    for (i in connections){
      var c = connections[i];
      if (!c.removed){
      json += '{"nodeA" : ' + c.startNode.id + ', ';
      json += '"nodeB" : ' + c.endNode.id + ', ';
      json += '"conA" : "' + c.startConnection.attr("class") + '", ';
      json += '"conB" : "' + c.endConnection.attr("class") + '", ';
      json += '"connectionType" : "' + c.connectionType + '"},';
      hasConnections = true;
      }
    }
    if (hasConnections){
      json = json.substr(0, json.length - 1);
    }
    json += ']}';
    return json;
  }
  
  function addSlashes(str) {
    str = str.replace(/\\/g,'\\\\\\\\');
    str = str.replace(/\'/g,'\\\'');
    str = str.replace(/\"/g,'\\\\"');
    str = str.replace(/\0/g,'\\0');
    str = str.replace(/\n/g,'\\\\n');
    str = str.replace(/\t/g,'\\\\t');
    return str;
  }
}