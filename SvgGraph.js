var step = 0;
var todo = [];

function Start(){
	BuildSvgGraph(1);
	BuildSvgGraph(2);
	Move();
}

function Move()
{
	setTimeout(Move, 50);
	RedrawGraphs();
	step++;
};

function MouseProc(e){

	id = e.currentTarget.id[3];
	svg_graph=todo[id-1];

	
	var rect = svg_graph.svg.getBoundingClientRect();

	Alert(e.type + " " + String(rect.top) + " "  + String(rect.left));
	if (e.type == "mousedown" || e.type == "touchstart"){
		svg_graph.g.SetDragged(mouseX(e)-svg_graph.hw, mouseY(e)-svg_graph.hh, 30);
		//Alert(e.type + " " +e.currentTarget.id[3] +" "+e.target);
	};
	if (e.type == "mousemove" || e.type == "touchmove"){
		svg_graph.g.MoveDragged	(mouseX(e)-svg_graph.hw, mouseY(e)-svg_graph.hh);
	};
	if (e.type == "mouseup" || e.type == "touchend"){
		svg_graph.g.StopDragging();
		//alert(e.type);
		};
	if (e.type == "touchmove"){
		e.preventDefault();
		};
};

function RedrawGraphs()
{
	for (var i = 0; i < todo.length; i++) {
		todo[i].g.Iterate();
		Redraw(todo[i]);
	}
}


function BuildSvgGraph(id)
{
	svg_id = "svg" + String(id);
	
	graph_spec = graph_specs[id-1];
	nodes_labels = graph_nodes_labels[id-1];
	nodes_size = graph_nodes_size[id-1];
	
	svg_element = document.getElementById(svg_id);

	svg_graph = new SvgGraph(svg_element, graph_spec, nodes_labels, nodes_size);
	if (id == 1){
		svg_graph.g.is3D = false;
	};
	RebuildGraph(svg_graph);

	todo.push(svg_graph);	
	n = todo.length;

}


function SvgGraph(svg_element, spec, nodes_labels, nodes_size)
{

	this.spec = spec;
	this.svg = svg_element;
	
	var svg = this.svg;
	svg.addEventListener("mousedown", MouseProc, false);
	svg.addEventListener("mousemove", MouseProc, false);
	svg.addEventListener("mouseup", MouseProc, false);
	
	svg.addEventListener("touchmove",MouseProc, false);	
	svg.addEventListener("touchstart",MouseProc, false);
	svg.addEventListener("touchend",MouseProc, false);
	svg.addEventListener("touchmove",MouseProc, false);
	
	this.c3d = { camz : 900, ang:0, d:0.015 };
	
	this.circs = [];
	this.lines = [];
	this.labls = [];
	this.labels_text = nodes_labels;
	this.nodes_size = nodes_size;
	
	this.w = Width-20;
	this.h = Height-20;
	this.hw= this.w/2;
	this.hh= this.h/2;
	this.labels = true;
	
	this.g = new Grapher2D();
	this.g.repulsion = 4*Repulsion;
	this.g.attraction = 0.001*Attraction;
	this.g.stable = false;
	
	this.g.physics = true;
	this.g.is3D = true;
	
}

ChangeLabels = function(svg_graph) 
{
	svg_graph.labels = !svg_graph.labels;
	for(var i=0; i<svg_graph.labls.length; i++) svg_graph.labls[i].style.visibility = (svg_graph.labels?"visible":"hidden");
}

MinColoring = function(svg_graph) 
{
	svg_graph.g.MinColoring();
	for(var i=0; i<svg_graph.circs.length; i++)
		svg_graph.circs[i].setAttribute("fill", colors[svg_graph.g.vcolors[i]%colors.length]);
}

function RebuildGraph(svg_graph)
{

	svg_graph.g.MakeGraph(svg_graph.spec);
	
	var svg = svg_graph.svg;
	
	for(var i=0; i<svg_graph.circs.length; i++) svg.removeChild(this.circs[i]);
	for(var i=0; i<svg_graph.lines.length; i++) svg.removeChild(this.lines[i]);
	for(var i=0; i<svg_graph.labls.length; i++) svg.removeChild(this.labls[i]);
	svg_graph.circs = [];
	svg_graph.lines = [];
	svg_graph.labls = [];
	
	for(i=0; i<svg_graph.g.graph.edgesl.length; i++)
	{
		var l = document.createElementNS("http://www.w3.org/2000/svg", "line");
		l.setAttribute("style", "stroke:#777;stroke-width:3");
		svg.appendChild(l);
		svg_graph.lines.push(l);
	}
	for(i=0; i<svg_graph.g.graph.n; i++)
	{
		var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		if(i==0){
			c.setAttribute("fill", "#FFFF00");
		}else{
			c.setAttribute("fill", "#FFFFFF");
		};	
		c.setAttribute("stroke", "#000000");
		c.setAttribute("style", "cursor:move;");
		svg.appendChild(c);
		svg_graph.circs.push(c);
		
		var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
		t.setAttribute("fill", "#000000");
		t.setAttribute("font-size", "14");
		t.setAttribute("style",  "pointer-events:none;");
		t.textContent = svg_graph.labels_text[i];
		svg.appendChild(t);
		svg_graph.labls.push(t);
	}
	
	Redraw(svg_graph);
};

function Redraw(svg_graph)
{
	//if(g.is3D) g.vertices.sort(sorter);
	
	var c3d = svg_graph.c3d;
	var g = svg_graph.g;
	
	c3d.ang += c3d.d;
	var sn = Math.sin(svg_graph.c3d.ang);
	var cs = Math.cos(svg_graph.c3d.ang);
	for(var i=0; i<g.graph.n; i++)
	{
		var nx, ny, nz;
		var v = g.vertices[i];
		if(g.is3D)
		{
			nx = cs*v.x - sn*v.z;
			nz = sn*v.x + cs*v.z;
			ny = v.y;
		}
		else {nx = v.x; ny = v.y; nz = v.z;}
		v.px = c3d.camz*nx/(c3d.camz - nz);
		v.py = c3d.camz*ny/(c3d.camz - nz);
		v.pz = nz;
	};
	
	var hw = svg_graph.hw, hh = svg_graph.hh;

	for(i=0; i<g.graph.edgesl.length; i++)
	{
		var u = g.vertices[g.graph.edgesl[i]];
		var v = g.vertices[g.graph.edgesr[i]];
		
		svg_graph.lines[i].setAttribute("x1", u.px + hw);
		svg_graph.lines[i].setAttribute("y1", u.py + hh);
		svg_graph.lines[i].setAttribute("x2", v.px + hw);
		svg_graph.lines[i].setAttribute("y2", v.py + hh);
	};
	
	var iw, kw;
	for(var i=0; i<g.graph.n; i++)
	{
		var v = g.vertices[i];
		iw = c3d.camz*13/(c3d.camz-v.pz);
		cx_upd = hw+v.px;
		cy_upd = hh+v.py;
		if (cx_upd < 5){cx_upd = 5};
		if (cy_upd < 5){cy_upd = 5};
		svg_graph.circs[i].setAttribute("cx", cx_upd);
		svg_graph.circs[i].setAttribute("cy", cy_upd);
		r_upd = Math.max(0,iw)*svg_graph.nodes_size[i];
		svg_graph.circs[i].setAttribute("r", r_upd);
		
		svg_graph.labls[i].setAttribute("x", cx_upd-5);
		svg_graph.labls[i].setAttribute("y", cy_upd+6);
	}
};


function getEl(s)
{
	return document.getElementById(s);
}


function sorter(a,b){return a.z - b.z}

function Alert(msg){
	res = getEl("res");
	res.innerHTML = "Result:" + msg;
}

function mouseX(e)
{

	id = e.currentTarget.id[3];
	svg_graph=todo[id-1];
	rect = svg_graph.svg.getBoundingClientRect();

	var cx;
	if(e.type == "touchstart" || e.type == "touchmove") {
		cx = e.touches.item(0).clientX;
	} else {
		cx = e.clientX;
	};
	return (cx-rect.left);
}
function mouseY(e)
{	
	id = e.currentTarget.id[3];
	svg_graph=todo[id-1];
	rect = svg_graph.svg.getBoundingClientRect();

	var cy;
	if(e.type == "touchstart" || e.type == "touchmove")	{
		cy = e.touches.item(0).clientY;
	} else {
		cy = e.clientY;
	};
	return (cy-rect.top); 
}

