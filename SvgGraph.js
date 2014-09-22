Gr = "4:1-2,2-3,3-1,1-4";
Height = 260;
Repulsion = 70;
Attraction = 20;
var step = 0;
var todo = [];

function Move()
{
	setTimeout(Move, 2000);
	alert('Move: '+String(step++));
	alert(todo);
	for (var i = 0; i < todo.length; i++) {
		alert(todo[i].svg.id);
	}
};

function SvgGraph(id)
{
	SvgGraph.main = this;
	todo.push(this);

	this.svg = document.getElementById(id);
	
	var svg = this.svg
	
	this.c3d = { camz : 900, ang:0, d:0.015 };
	
	this.circs = [];
	this.lines = [];
	this.labls = [];
	
	this.w = window.innerWidth-20;
	this.h = Height;
	this.hw= this.w/2;
	this.hh= this.h/2;
	this.labels = true;
	
	this.g = new Grapher2D();
	this.g.repulsion = 4*Repulsion;
	this.g.attraction = 0.001*Attraction;
	this.g.stable = false;
	
	this.g.Switch3D();
	this.g.SwitchPhysics();
	
	SvgGraph.rebuild();
	alert("Call");
	this.timeredraw();
	
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

RebuildGraph = function(svg_graph, graph_spec)
{
	svg_graph.g.MakeGraph(graph_spec);
	
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
		c.setAttribute("fill", "#06E313");
		c.setAttribute("stroke", "#000000");
		svg.appendChild(c);
		svg_graph.circs.push(c);
		
		var t = document.createElementNS("http://www.w3.org/2000/svg", "text");
		t.setAttribute("fill", "#fff");
		t.setAttribute("font-size", "14");
		t.setAttribute("style",  "pointer-events:none;");
		t.textContent = i+1;
		svg.appendChild(t);
		svg_graph.labls.push(t);
	}
	
	Redraw(svg_graph);
}

Redraw = function(svg_graph)
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
	}
	
	var hw = svg_graph.hw, hh = svg_graph.hh;

	for(i=0; i<g.graph.edgesl.length; i++)
	{
		var u = g.vertices[g.graph.edgesl[i]];
		var v = g.vertices[g.graph.edgesr[i]];
		
		svg_graph.lines[i].setAttribute("x1", u.px + hw);
		svg_graph.lines[i].setAttribute("y1", u.py + hh);
		svg_graph.lines[i].setAttribute("x2", v.px + hw);
		svg_graph.lines[i].setAttribute("y2", v.py + hh);
	}
	
	var iw, kw;
	for(var i=0; i<g.graph.n; i++)
	{
		var v = g.vertices[i];
		iw = c3d.camz*13/(c3d.camz-v.pz);
		
		svg_graph.circs[i].setAttribute("cx", hw+v.px);
		svg_graph.circs[i].setAttribute("cy", hh+v.py);
		svg_graph.circs[i].setAttribute("r", Math.max(0,iw));
		
		svg_graph.labls[i].setAttribute("x", hw+v.px-(i>8?10:5));
		svg_graph.labls[i].setAttribute("y", hh+v.py+6);
	}
}


function getEl(s)
{
	return document.getElementById(s);
}


function sorter(a,b){return a.z - b.z}
