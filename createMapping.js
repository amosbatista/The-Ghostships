var imgObject;
var svgObject;
var mapList;
var currentMapNumber = 0;
var actualPage;
var imgX;
var imgY;
var imgCurrentScale;
var actualEpisode;
var DOMParaghResult;
var DOMTxtFilePath;


/*Objects*/
function _episode (episodenumber, idiom, prologue, title, imgHeaderPath){
	this.prologue = prologue;
	this.pages = new Array();
	this.idiom = idiom;
	this.episodenumber = episodenumber;
	this.Prologue = prologue;
	this.Title = title;
	this.ImgHeaderPath = imgHeaderPath;
	this.AddPage = function(newPage){
		this.pages.push(newPage);
	}
}

function _map (x,y,scale,transitionType){
	this.x = x;
	this.y = y;
	this.scale = parseFloat(scale.toFixed(2));
	this.transitionType = transitionType;
}
function _page (path) {
	this.path = path;
	this.maps = new Array();
	this.AddMap = function(newMap){
		this.maps.push(newMap);
	}
	this.GetMap = function(mapNumber){
		return this.maps[mapNumber - 1];
	}	
	this.SetMap = function(mapNumber, newMap){
		this.maps[mapNumber - 1] = newMap;
	}	
	this.GetMapCount = function(){
		return this.maps.length;
	}	
}

function init(){
	svgObject = document.getElementById("svgRegion");
	imgObject = document.getElementById("myImage");
	DOMParaghResult = document.getElementById("LBLResult");
	DOMTxtFilePath = document.getElementById("filePath");
	
	fatorZoom = 1.1;
	fatorScroll = 40;
	imgX = 0;
	imgY = 0;
	imgCurrentScale = 1;
	//svgObject.addEventListener("click", ChangeMap, false);	
	
	// Adding events to the buttons
	// UP, DOWN, LEFT, Right
	document.getElementById("cmd_up").addEventListener("click",RaiseY,false);
	document.getElementById("cmd_left").addEventListener("click",RaiseX,false);
	document.getElementById("cmd_right").addEventListener("click",LowX,false);
	document.getElementById("cmd_down").addEventListener("click",LowY,false);
	document.getElementById("cmd_down").addEventListener("click",LowY,false);
	
	//document.addEventListener("keydown", ProcessKeyboardEvent, true);
	// ZOOM
	document.getElementById("cmd_zoom_in").addEventListener("click",RaiseScale,false);
	document.getElementById("cmd_zoom_out").addEventListener("click",LowScale,false);
	
	ChangeMap();
	document.getElementById("prologue").value = "";
	
	document.addEventListener("keydown", ChangeMapByPress, false);
}
function startNewEpisode(){
	var txtEpisodeNumber = document.getElementById("txtEpisodeNumber").value;
	var idiom = "en";
	var prologue = document.getElementById("prologue").value;
	var title = document.getElementById("txttitle").value;
	var imgHeaderTitle = document.getElementById("episodeImagePath").value;
	
	
	actualEpisode = new _episode(txtEpisodeNumber, "en", prologue, title, imgHeaderTitle);
	DOMParaghResult.innerText = "A new episode has been created, and the map cleared";
}
function loadImageFromPath(){
	actualPage = new _page(DOMTxtFilePath.value);
	setImagePath(DOMTxtFilePath.value);
	ClearMapList();
	DOMParaghResult.innerText = "A new map has begun.";
}
function setImagePath(imagePath){
	imgObject.setAttribute("xlink:href",imagePath);
}
function loadEpisodeImageFromPath(){
	document.getElementById("episodeHeader").setAttribute("src", document.getElementById("episodeImagePath").value);
}

function RaiseScale(){
	imgCurrentScale = imgCurrentScale * fatorZoom;
	LowX();
	LowY()
	ChangeMap();
}
function LowScale(){
	imgCurrentScale = imgCurrentScale / fatorZoom;
	// Setting a scroll to compesating the zoom
	RaiseX();
	RaiseY();
	ChangeMap();
}
function RaiseX(){
	imgX = imgX + fatorScroll;
	ChangeMap();
}
function LowX(){
	imgX = imgX - fatorScroll;
	ChangeMap();
}
function RaiseY(){
	imgY = imgY + fatorScroll;
	ChangeMap();
}
function LowY(){
	imgY = imgY - fatorScroll;
	ChangeMap();
}

function ProcessKeyboardEvent(evt){
	if (evt.keyCode == 37) //Left
		LowX();
	if (evt.keyCode == 39) // Rigth
		RaiseX();
	if (evt.keyCode == 38) // UP
		LowY();	
	if (evt.keyCode == 40) //Down
		RaiseY();
	return false;
}

function AddPageMap(){
	var DOMRdoTransitionType = document.getElementById("rdoTransitionType");
	var newMap = new _map(imgX,imgY, imgCurrentScale, DOMRdoTransitionType.value);
	actualPage.AddMap(newMap);
	createNewMap_ToList(actualPage.GetMapCount());
	DOMParaghResult.innerText = "This position map has been setted to this page. Keep adding!";
}
function AddPageToEpisode(){
	actualEpisode.AddPage(actualPage);
	DOMParaghResult.innerText = "This page has been added to this episode. Set a new page to the episode.";
	DOMTxtFilePath.value="";
}
// After all programming, save the episode to database.
function FinishMap(){

	var form = document.getElementById("form_submit");
	document.getElementById("episode").value = JSON.stringify(actualEpisode);
	form.submit();
	
	DOMParaghResult.innerText = "Episode Done!!!!!";
}

function SetImageViewByMap(x,y,scale){
	imgObject.setAttribute("transform","translate(" + x + ", " + y + ") scale(" + scale + ")");
}
function ChangeMap(){
	SetImageViewByMap(imgX,imgY,imgCurrentScale);
	DOMParaghResult.innerText = "Altering map. Press map to set the new position.";
	//setTextFields(imgX,imgY,imgCurrentScale);
}
function setTextFields(x,y,scale){
	DOMTxtScale.value = scale;
	DOMTxtX.value = x;
	DOMTxtY.value = y;
}
function SetScaleManualy(){
	imgCurrentScale = DOMTxtScale.value;
	ChangeMap();
}
function SetXManually(){
	imgX = DOMTxtX.value;
	ChangeMap();
}
function SetYManuallY(){
	imgY = DOMTxtY.value;
	ChangeMap();
}

function ChangeMapByPress(evt){
	if(evt.keyCode == 37) //Right
		RaiseX();
	if(evt.keyCode == 39) // Left
		LowX();
	if(evt.keyCode == 38) // Up
		RaiseY();
	if(evt.keyCode == 40) // Down
		LowY();
	if(evt.keyCode == 107) // +
		RaiseScale();
	if(evt.keyCode == 109) // -
		LowScale();
		
	// Set the scroll always on the top, when get a flag
	if ((evt.keyCode >= 37 && evt.keyCode <= 40) || (evt.keyCode == 107 || evt.keyCode == 109))
		document.scrollingElement.scrollTop = 0; 
}

function createNewMap_ToList(mapNumber){
	// Getting the parend element to div
	var divMapZone = document.getElementById("mapZone");
	
	// Creating the paragraph element to the page
	var p_mapElement = document.createElement("p");
	
	// Setting the ID
	p_mapElement.setAttribute ("id","mapItem_" + mapNumber);

	// Creating a input hidden element
	var inputElement = document.createElement ("input");
	inputElement.setAttribute("type", "hidden");
	inputElement.setAttribute("id", "mapNumber_" + mapNumber);
	inputElement.setAttribute("value", mapNumber);
	
	// Append to the paragraph
	p_mapElement.appendChild(inputElement);
	
	// Setting the caption 
	var txtLabelMapNumber = document.createTextNode(mapNumber + " - ");
	p_mapElement.appendChild(txtLabelMapNumber);
	
	// Creating the Test button
	var buttonViewMap = document.createElement("button");
	buttonViewMap.setAttribute("id", "btnTestMap_" + mapNumber);
	buttonViewMap.setAttribute("type", "button");
	buttonViewMap.setAttribute("onclick", "TestMap(" + mapNumber + ");");
	
	// Creating text button label
	var txtLabelButtonTestMap = document.createTextNode("Test map " + mapNumber);
	buttonViewMap.appendChild(txtLabelButtonTestMap);
	p_mapElement.appendChild(buttonViewMap);
	
	// Creating the edit button
	var buttonEditMap = document.createElement("button");
	buttonEditMap.setAttribute("id", "btnEditMap_" + mapNumber);
	buttonEditMap.setAttribute("type", "button");
	buttonEditMap.setAttribute("onclick", "EditMap(" + mapNumber + ");");
	
	// Creating text button label
	var txtLabelButtonEditMap = document.createTextNode("Edit map " + mapNumber);
	buttonEditMap.appendChild(txtLabelButtonEditMap);
	p_mapElement.appendChild(buttonEditMap);
	
	// Appending element to the div
	divMapZone.appendChild(p_mapElement);
	
}

function ClearMapList(){
	// Getting the parend element to div
	var divMapZone = document.getElementById("mapZone");
	
	var childElementCount;
	var listCount = divMapZone.childNodes.length;
	
	// Listing all itens in the map
	for (childElementCount = 0; childElementCount < listCount; childElementCount++ ){
		divMapZone.removeChild(divMapZone.childNodes[0]);
	}
}

function TestMap(mapNumber){
	imgX = actualPage.GetMap(mapNumber).x;
	imgY = actualPage.GetMap(mapNumber).y;
	imgCurrentScale = actualPage.GetMap(mapNumber).scale;
	
	// Reflect the changes to the image
	ChangeMap();
	
	DOMParaghResult.innerText = "The visualization has been changed.";
}

function EditMap(mapNumber){
	var DOMRdoTransitionType = document.getElementById("rdoTransitionType");
	var newMap = new _map(imgX,imgY, imgCurrentScale, DOMRdoTransitionType.value);
	actualPage.SetMap(mapNumber, newMap);
	
	DOMParaghResult.innerText = "The map " + mapNumber + " has been changed.";
}
