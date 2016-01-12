// DOM Page-like elements 
var DOMPageContentList = new Array();

//DOM objects
var DOMLogoIdiom;
var DOMarrow_moveNextMap;
var DOMarrow_movePrevMap;
var greyBackground;
var svgObject;
var DIV_SgvHolder;
var DOMLogo_LoadTransict;
var currentMapNumber;
var actualMap_x;
var actualMap_y;
var actualMap_scale;
var newMap;
var episodeNumber;
var currentEpisode;
var currentIdiom;
var currentPage;
var resquestMapTransationID = null; 
var loadPageTransitionID = null;
var animLogoTransitionID = null;
var imageLoaded = 0;

var jSonRequisition;

var episodeList;

var movePageAction;

// Object representing all the text content
var textRepository;


// Constants
var dominio;
	
function initPage(){
	
	// Setting the URL of the page
	dominio = document.origin;
	
	DOMLogoIdiom = document.getElementById("logo_idiom");
	greyBackground = document.getElementById("background_Load_Info");
	DOMarrow_moveNextMap = document.getElementById("arrow_moveNextMap");
	DOMarrow_movePrevMap = document.getElementById("arrow_movePrevMap");
	DOMLogo_LoadTransict = document.getElementById("logo_loadTransition");
	svgObject = document.getElementById("svgRegion");
	DIV_SgvHolder = document.getElementById("div_svgHolder");
	
	// Defining the display elements list
	DOMPageContentList.push(document.getElementById("myImage"));
	DOMPageContentList.push(document.getElementById("div_about"));
	DOMPageContentList.push(document.getElementById("div_License"));
	DOMPageContentList.push(document.getElementById("div_Donate"));
	DOMPageContentList.push(document.getElementById("div_Contact"));
	
	// Setting the image element to the top
	showElementAbove(DOMPageContentList[0]);
	
	currentIdiom = GetInitialIdiom();
	currentPage = 0;
	currentMapNumber = 0;
	
	// Starting XMLHTTP
	jSonRequisition = new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	
	if (jSonRequisition == undefined){
		// code for IE6, IE5
		jSonRequisition = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	
	AddImageEvents();
	
	// Adding the event OnLoad to the image, to detect when load is finished. On OnLoad, execute a function that flag when stop the animation
	DOMPageContentList[0].addEventListener("load", function(){
		imageLoaded = 1;
	}, false);	
	
	// Loading the episode list
	LoadEpisodeList();
	
	// Loading the string repository
	LoadStringRepository();
}
// Function to create 
function AddImageEvents(){
	// Adding events
	svgObject.addEventListener("click", ChangeMapByClick, false);	
	svgObject.addEventListener("contextmenu", ChangeMapByClick, false);	
	DOMLogoIdiom.addEventListener("click", ChangeIdiom, false);

	// Flags inside the image
	DOMarrow_moveNextMap.addEventListener("click", ChangeMapByClick, false);
	DOMarrow_movePrevMap.addEventListener("click", ChangeMapByClick, false);
	DOMarrow_moveNextMap.addEventListener("mouseover", ChangeArrowColor, false);
	DOMarrow_movePrevMap.addEventListener("mouseover", ChangeArrowColor, false);
	DOMarrow_moveNextMap.addEventListener("mouseout", ClearArrowColor, false);
	DOMarrow_movePrevMap.addEventListener("mouseout", ClearArrowColor, false);
	
	document.addEventListener("keydown", ChangeMapByClick, false);

}

// Functions that change the color of arrow, or clear the color
function ChangeArrowColor(evt){
	if(evt.srcElement == DOMarrow_moveNextMap)
		DOMarrow_moveNextMap.setAttribute("fill-opacity",0.75);
	else if(evt.srcElement == DOMarrow_movePrevMap)
		DOMarrow_movePrevMap.setAttribute("fill-opacity",0.75);
}
function ClearArrowColor(evt){
	if(evt.srcElement == DOMarrow_moveNextMap)
		DOMarrow_moveNextMap.setAttribute("fill-opacity",0);
	else if(evt.srcElement == DOMarrow_movePrevMap)
		DOMarrow_movePrevMap.setAttribute("fill-opacity",0);
}

/* Function that programming the transition of the maps when the user clicks. 
If occours the end of map, increment the episode and loads the next page. 
Loads the next episode if there's no episode.*/
function ChangeMapByClick(evt){
	
	// First, to detect if the event if a change of image map, and detect if the image is already loaded
	if ((GetAction(evt) == "AHEAD" || GetAction(evt) == "BACK" ) && imageLoaded == 1) {
	
		// Detect an action to move ahead
		if (GetAction(evt) == "AHEAD"){
			
			// Set the event action to global 
			movePageAction = "AHEAD";
			
			// See if the limit of page
			if(currentMapNumber < currentEpisode.Pages[currentPage].Maps.length - 1){
			//When its possible to change to next map, increment counter and set the map to image
				currentMapNumber++;
				SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
			}
			else{
				// Trying to move to another page, to the first map
				if(currentPage < currentEpisode.Pages.length - 1){
					currentPage++;
					LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
				}
				else{
					// If in the limit of the pages, load the next episode
					episodeNumber++;
					LoadEpisode(episodeNumber);

					// Watch and return the episode minus 1, when it detect error
					if (ReturnIfImageError() == true)
						episodeNumber = 0;    
				}
			}
			
		}
		else if (GetAction(evt) == "BACK"){
			
			// Set the event action to global 
			movePageAction = "BACK";
			
			// See if the limit of page
			if(currentMapNumber >= 1){
			//When its possible to change to last map, decrement counter and set the map to image
				currentMapNumber--;
				SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
			}
			else{
				// Trying to move to another page, to the last map
				if(currentPage >= 1){
					currentPage--;
					LoadPageToSVG(currentEpisode.Pages[currentPage].Path);
				}
				else{
					// If in the start of the pages, load the last episode
					episodeNumber--;
					LoadEpisode(episodeNumber);

					// Watch and return the episode plus 1, when it detect error
					if (ReturnIfImageError() == true)
						episodeNumber = 0;   
				}
			}
		}
	}
	else{
	
		// Detecting event to exit the SubPages tutorial
		if (GetAction(evt) == "ESC"){
			ClosePageElement();
		}
		//In case of Context Menu, return false to do not allow to show the submenu
		else{
			if (evt.type == "contextmenu") 
				return false;
			else
				return true;
		}
	}
}

// Function that return True if the first image is a image error, or false, if it's normal
function ReturnIfImageError() {
    if (currentEpisode.Pages[0].Path.search("img_warning") > 0)
        return true;
    else
        return false;
    
}
//Function that receive an event and return if must go ahead or back of an action
function GetAction(evt){
	
	// Detecting click of the arrows inside map
	if(evt.srcElement == DOMarrow_moveNextMap){
		if (evt.stopPropagation) //if stopPropagation method supported
			evt.stopPropagation();
		else
			event.cancelBubble = true;
			
		return "AHEAD";
	}
	else if(evt.srcElement == DOMarrow_movePrevMap){
		if (evt.stopPropagation) //if stopPropagation method supported
			evt.stopPropagation();
		else
			event.cancelBubble = true;
			
		return "BACK";
	}
	
	else if (evt.type == "click" || evt.type == "contextmenu"){ // Get Mouse Event. When occurs a 'contextmenu', it's meaning there's a right click.
		if (evt.which == 1) // Left mouse click
			return "AHEAD";
		else if (evt.which == 3) // Right mouse click
			return "BACK";
	}
	else if(evt.type == "keydown"){ // Keyboard event
		if(evt.keyCode == 37)
			return "BACK";
		if(evt.keyCode == 39)
			return "AHEAD";
		if(evt.keyCode == 27) // Esc button. Specific to exit the subpages
			return "ESC";
	}
	
	
}

// That will generate the episode list in the page
function LoadEpisodeList(){
	
	// Loading the episode element
	// Starting XMLHTTP
	jSonRequisition_LoadEpisode = new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	
	if (jSonRequisition_LoadEpisode == undefined){
		// code for IE6, IE5
		jSonRequisition_LoadEpisode = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	// Requesting JSON
    jSonRequisition_LoadEpisode.onreadystatechange = function () {

        if (jSonRequisition_LoadEpisode.readyState == 4 && jSonRequisition_LoadEpisode.status == 200){  // readyState == 4: Request finished and function ready - jSonRequisition.status == 200: OK

            // Loading JSOn to object
            episodeList = JSON.parse(jSonRequisition_LoadEpisode.responseText);
			
			// Getting the div will keep the list
			var domEpisodeListHolder = document.getElementById ("episodeListHolder");
			var episodeListElement;
			var linkElement;
			
			var actCount = 0;
			
			// Listing all episode list
			for(actCount = 0; actCount < episodeList.length; actCount++){
				
				// Creating a <a> element
				linkElement = document.createElement("a");
				linkElement.setAttribute("href","javascript:void(0)");
				
				// Creating a <img> element
				episodeListElement = document.createElement("img");
				
				// Setting the new element
				episodeListElement.setAttribute("class", "imgEpisodeLogo");
			
				episodeListElement.setAttribute("id", "imgEpisodeList" + episodeList[actCount].EpisodeNumber);
				episodeListElement.setAttribute("src", episodeList[actCount].ImgHeaderPath);
				episodeListElement.setAttribute("alt", "Episode " + episodeList[actCount].EpisodeNumber);
				episodeListElement.setAttribute("onclick", "LoadEpisode(" + episodeList[actCount].EpisodeNumber + ")");
		
				// Append the link and image element
				domEpisodeListHolder.appendChild (linkElement);
				linkElement.appendChild (episodeListElement);
			}
			
			// Getting the last episode number
			episodeNumber = episodeList[episodeList.length - 1].EpisodeNumber;
			
			// Loading the LAST episode to load (the load episode must be here, because of async call of this function
			LoadEpisode(episodeNumber);
			
		}
    }
	var urlEpisodeLoader = dominio + "/EpisodeList.aspx";
	jSonRequisition_LoadEpisode.open("GET", urlEpisodeLoader, true);
	jSonRequisition_LoadEpisode.send();
	
}

// Function that will activate the Ajax process to load a episode object (with pages and its maps) from the server
function LoadEpisode(episodeNumber){
	
	// Requesting JSON
    jSonRequisition.onreadystatechange = function () {

        if (jSonRequisition.readyState == 4 && jSonRequisition.status == 200) { // readyState == 4: Request finished and function ready - jSonRequisition.status == 200: OK

            // Loading JSOn to object
            currentEpisode = JSON.parse(jSonRequisition.responseText);

            // Loading the first page of this episode
            currentPage = 0;
            LoadPageToSVG(currentEpisode.Pages[currentPage].Path);

            //Setting first map
            currentMapNumber = 0;
            SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);

            // Finishing the transition and return the background to finish
            imageLoaded = 1;
        }
    }
	var urlComicsServer = dominio + "/CarregarEpisodio.aspx?episodeNumber=" + episodeNumber + "&idiom=" + currentIdiom;
	jSonRequisition.open("GET", urlComicsServer, true);
	jSonRequisition.send();
	
	// Inicializing the animation process
	bgFadeIn();
	AnimateLogo();
	
}
 
//Function to manipulate the page visualization
function MoveToFirstPage(){
	// Setting the page map and load
	currentPage = 0;
	currentMapNumber = 0;
	LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
	SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);	
}
function MoveToLastPage(){
	// Setting the page map and load
	currentPage = currentEpisode.Pages.length - 1;
	currentMapNumber = 0;
	LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
	SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);	
}
function MoveToPrevPage(){
	if(currentPage >= 1){
		currentPage--;
		currentMapNumber = 0;
		LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
		SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
	}	
}
function MoveToNextPage(){
	if(currentPage < currentEpisode.Pages.length - 1){
		currentPage++;
		currentMapNumber = 0;
		LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
		SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
	}
}


function SetImageViewByMap(map){
	if (actualMap_x == undefined){ // If it's the first time map, set the last time and go directly to the map
	//if (true){ // If it's the first time map, set the last time and go directly to the map
	
		actualMap_x = map.X;
		actualMap_y = map.Y;
		actualMap_scale = map.Scale;
		SetImageView(map.X, map.Y ,map.Scale);
	}
	else{

		if (resquestMapTransationID == null)	
			resquestMapTransationID = setInterval(function (){
				
				if (actualMap_x == currentEpisode.Pages[currentPage].Maps[currentMapNumber].X && actualMap_y == currentEpisode.Pages[currentPage].Maps[currentMapNumber].Y && actualMap_scale.toFixed(2) == currentEpisode.Pages[currentPage].Maps[currentMapNumber].Scale.toFixed(2)){ // Stop the animation when all the parameters get the same of the map destiny
					clearInterval(resquestMapTransationID);
					resquestMapTransationID = null;
					return;
				}
				// Setting the values of the local variables, configurating its values. 
				var _x = parseInt(currentEpisode.Pages[currentPage].Maps[currentMapNumber].X);
				var _y = parseInt(currentEpisode.Pages[currentPage].Maps[currentMapNumber].Y);
				actualMap_x = CalculateTransition(actualMap_x, _x, currentEpisode.Pages[currentPage].Maps[currentMapNumber].transitionType);
				actualMap_y = CalculateTransition(actualMap_y, _y, currentEpisode.Pages[currentPage].Maps[currentMapNumber].transitionType);
				//actualMap_scale = CalculateScaleTransition(actualMap_scale, currentEpisode.Pages[currentPage].Maps[currentMapNumber].Scale, currentEpisode.Pages[currentPage].Maps[currentMapNumber].transitionType);
				// As the scale() transition is very slow, I'll setup the scale level once.
				actualMap_scale = currentEpisode.Pages[currentPage].Maps[currentMapNumber].Scale;
				
				// Setting the image scale, with the new values setted
				SetImageView(actualMap_x, actualMap_y, actualMap_scale);
				
			}, 20);
	}
}

// Function that receives a parameter, a parameter destiny (ex: a X ou Y), and return the distance that parameter must me set.
function CalculateTransition(parameter, destinyParameter, TransitionSpeed){
	if (parameter == destinyParameter) // If the parameter was in the same position of its destiny, return it
		return parameter;
	else {
		
		if (parameter < destinyParameter) // If the parameter is minor than destiny, calculate the half of the track to the front
			return parameter + Math.ceil((destinyParameter - parameter) / 5);	
		else // And if the parameter is minor than destiny, calculate the half of the track to the back
			return parameter - Math.ceil((parameter - destinyParameter) / 5);	
	}
	
}

// Function that are the same of above, but calculates a decimal valor
function CalculateScaleTransition(parameter, destinyParameter, TransitionSpeed){
	// Setting the transition speed
	if(TransitionSpeed == "fast-background")
		parameterChange = 0.05;
	else
		parameterChange = 0.01;
	if (parameter.toFixed(2) == destinyParameter.toFixed(2)) // If the parameter was in the same position of its destiny, return it
		return parameter;
	else {
		
		if (parameter < destinyParameter) // If the parameter is minor than destiny, calculate the half of the track to the front
		
			//return parameter + roundValueToDigits((destinyParameter - parameter) / 5) + 0.01;	
			return roundValueToDigits(parameter + parameterChange);	
		else // And if the parameter is minor than destiny, calculate the half of the track to the back
			//return parameter - roundValueToDigits((parameter - destinyParameter) / 5) - 0.01;	
			return roundValueToDigits(parameter  - parameterChange);	
	}
}


// Function to configurare the Image object, to set the transaction attributes, and to move and zoom the image
function SetImageView(x, y, scale){
	DOMPageContentList[0].setAttribute("transform","translate(" + x + ", " + y + ") scale(" + scale + ")");
}
/* Function to read the episode number from episode Hidden tag */
function GetEpisodeNumber(){
	return document.getElementById("episodeNumber").value;
}
function GetInitialIdiom(){
	return document.getElementById("idiom").value;
}

// Function to load a page
function LoadPageToSVG(imagePath){

	// Setting image path. Here, the image path will be replaced with the path of the current translation folder
	DOMPageContentList[0].setAttribute("xlink:href", imagePath.replace("en", currentIdiom));
	DOMPageContentList[0] = document.getElementById("myImage");
	
	// Setting the image download link
	document.getElementById("link_openPage").setAttribute("href", imagePath);
	
	// Start of the transition. Only start if there's no image upload now
	if (imageLoaded == 1){
		bgFadeIn();
		AnimateLogo();
	}
	
}

function roundValueToDigits(value){
	return parseFloat(value.toFixed(2));
}

// Function to change the idiom of the page, and also, of the image
function ChangeIdiom(){	
	var contRepository = 0;
	
	if(currentIdiom == "en"){
		currentIdiom = "pt"; // Change the idiom
		
		// Changing the logo
		DOMLogoIdiom.setAttribute("src","img\\idiom_en.jpg");
	}
	else{
		currentIdiom = "en"; // Change the idiom
		
		// Changing the logo
		DOMLogoIdiom.setAttribute("src","img\\idiom_pt.jpg");
	}
	
	// Set all the text content to the current idiom
	setCaptionsFromTranslation();
	
	// Loading the image again. After the change of idiom, the path of the image will set, changing the current "en" folder to the current idiom
	LoadPageToSVG(currentEpisode.Pages[currentPage].Path);		
	SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);	
			
}

// Function that will set all the text to the contet of translation object
function setCaptionsFromTranslation(){
	var contRepository = 0;
	
	if(currentIdiom == "pt"){
		// Setting captions
		// Run all the caption repository, to set all the Paragraphs elements of the page
		for (contRepository = 0; contRepository < textRepository.length; contRepository++)
			document.getElementById(textRepository[contRepository].DOMElementID).innerText = textRepository[contRepository].PortugueseContent;
	}
	else{
		// Setting captions
		// Run all the caption repository, to set all the Paragraphs elements of the page
		for (contRepository = 0; contRepository < textRepository.length; contRepository++)
			document.getElementById(textRepository[contRepository].DOMElementID).innerText = textRepository[contRepository].EnglishContent;
	}
}

// Function that generate the animation process of fade-in
function bgFadeIn(){

	var bgTransparency = 0.0;
	
	// Set the indication of fade-in to 0;
	imageLoaded = 0;
	
	// Putting the background above the image
	greyBackground.parentNode.appendChild(greyBackground);
	
	if (loadPageTransitionID == null){
		// Start the animation
		loadPageTransitionID = setInterval(function (){
		
			// Finish the animation when the process finish
			if( imageLoaded == 1 ){
				
				// Only after change the image, move the map to the first map. It must be before all process, to ensure better transition
				if (movePageAction == "AHEAD"){
					currentMapNumber = 0;
					SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
				}
				else if(movePageAction == "BACK"){					
					currentMapNumber = currentEpisode.Pages[currentPage].Maps.length - 1;
					SetImageViewByMap(currentEpisode.Pages[currentPage].Maps[currentMapNumber]);
				}
					
				// When detect the load, generate the reverse animation. Return the original transparency.
				if ( roundValueToDigits(bgTransparency) >= 1.0 && roundValueToDigits(bgTransparency) <= 1.0  ) // Workarround when transaparency get a big value
					bgTransparency == 0;
				if( bgTransparency.toFixed(2) != "0.00" ){
					bgTransparency = CalculateScaleTransition(bgTransparency, 0.0, "fast-background");
					greyBackground.setAttribute("opacity", bgTransparency);
				}
				else{ // If the transparency go complete, finish the animation
					greyBackground.setAttribute("opacity", 0);
					
					// Passing the image to the top of screen
					DOMPageContentList[0].parentNode.appendChild(DOMPageContentList[0]);
					DOMarrow_moveNextMap.parentNode.appendChild(DOMarrow_moveNextMap);
					DOMarrow_movePrevMap.parentNode.appendChild(DOMarrow_movePrevMap);
					
					clearInterval(loadPageTransitionID);
					loadPageTransitionID = null;
					return;
				}
			}
			else{
				// Set the transition of transparancy. When the transparency got the finish value, just ignore.
				bgTransparency = CalculateScaleTransition(bgTransparency, 0.75, "fast-background");
				greyBackground.setAttribute("opacity", bgTransparency);
			}

		}, 20);
	}
}

// Function to show an specific "DIV Page" above the others elements
function showElementAbove(element){
	
	// Setting the page to the top
	element.style.opacity = 0.0;	
	element.style.zIndex = 2;

	// Generate the transition animation of the page
	var bgTransparency_show = 0.00;
	var subPageAnimat_TransID = setInterval(function (){

		// Finish of the transition
		if (bgTransparency_show >= 1.00){
			clearInterval(subPageAnimat_TransID);
			subPageAnimat_TransID = null;
			element.style.opacity = 1.00;	
			
			// Hiding the others elements, exception the element called to this function and the image element
			for (cont = 1; cont < DOMPageContentList.length; cont++){
	
				if (DOMPageContentList[cont] != element){			
					DOMPageContentList[cont].style.opacity = 0.0;
					DOMPageContentList[cont].style.zIndex = -1;
				}
			}
			
			// Returning the actual element zIndex to 1
			element.style.zIndex = 1;
			
			// In the end of the set, aways set the windows scroll to 0, to return to the top
			DIV_SgvHolder.scrollTop = 0;
			document.scrollingElement.scrollTop = 0;
			return;
		}
					
		// Generate the transition
		bgTransparency_show = CalculateScaleTransition (bgTransparency_show, 1.00, "fast-background");
		element.style.opacity = bgTransparency_show;	
	}, 20);
}

//Function that hide the element page "about page, for example", and show the image element
function ClosePageElement(){

	// Find the current element
	for (cont = 1; cont < DOMPageContentList.length; cont++){
	
		if (DOMPageContentList[cont].style.zIndex == 1){
	
			// Generate the transition animation of the page
			var bgTransparency_fade = 1.00;
			var elementToFade = cont; // Get the element number to change, because the animation is async
			var subPageFade_TransID = setInterval(function (){
			
				// Finish of the transition
				if (bgTransparency_fade <= 0.00){
					clearInterval(subPageFade_TransID);
					subPageFade_TransID = null;
					DOMPageContentList[elementToFade].style.opacity = 0.00;	
					DOMPageContentList[elementToFade].style.zIndex = -1;
					
					// In the end of the set, aways set the windows scroll to 0, to return to the top
					DIV_SgvHolder.scrollTop = 0;
					document.scrollingElement.scrollTop = 0;
					return;
				}
				
				// Generate the transition
				bgTransparency_fade = CalculateScaleTransition (bgTransparency_fade, 0.00, "fast-background");
				DOMPageContentList[elementToFade].style.opacity = bgTransparency_fade;	
			}, 20);
		}
	}
	
	// Set the scroll type to none, when the image return to the top.
	DIV_SgvHolder.style.overflow = "hidden";
}

//Functions those call specific pages
function CallAboutPage(){
	showElementAbove(DOMPageContentList[1]);
	DIV_SgvHolder.style.overflow = "scroll";
}
function CallLicensePage(){
	showElementAbove(DOMPageContentList[2]);
	DIV_SgvHolder.style.overflow = "scroll";
}

function CallDonatePage(){
	showElementAbove(DOMPageContentList[3]);
	DIV_SgvHolder.style.overflow = "scroll";
}

function CallContactPage(){
	showElementAbove(DOMPageContentList[4]);
	DIV_SgvHolder.style.overflow = "scroll";
}

// Function that loads the string repository, to fill all text content
function LoadStringRepository(){
	
	// Starting XMLHTTP
	jSonRequisition_stringRep = new XMLHttpRequest();// code for IE7+, Firefox, Chrome, Opera, Safari
	
	if (jSonRequisition_stringRep == undefined){
		// code for IE6, IE5
		jSonRequisition_stringRep = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	// Requesting JSON
    jSonRequisition_stringRep.onreadystatechange = function () {

        if (jSonRequisition_stringRep.readyState == 4 && jSonRequisition_stringRep.status == 200){  // readyState == 4: Request finished and function ready - jSonRequisition.status == 200: OK

            // Loading JSOn to object
            textRepository = JSON.parse(jSonRequisition_stringRep.responseText);       
			currentPage = 0;

			// Setting right now the paragraphs caption
			setCaptionsFromTranslation();		
		}
    }
	var urlComicsServer = dominio + "/Translation.aspx";
	jSonRequisition_stringRep.open("GET", urlComicsServer, true);
	jSonRequisition_stringRep.send();
}

// Function that execute the logo animation, during loading
function AnimateLogo(){

	var bgTransparency = 0.00;
	var animateProcess = "";
	
	// Starting the animation
	if (animLogoTransitionID == null){
		// Start the animation
		animLogoTransitionID = setInterval(function (){
			
			// Ending the animation, when the image has been loaded
			if( imageLoaded == 1){
			
				clearInterval(animLogoTransitionID);
				animLogoTransitionID = null;
				DOMLogo_LoadTransict.setAttribute ("opacity", 0.0);	
				return;
			}
			else{ // Continuing with animation
				// Putting the logo in the front
				DOMLogo_LoadTransict.parentNode.appendChild(DOMLogo_LoadTransict);
				
				// Setting the transparency of the logo. If the logo gets transparent, return to the visibility and vice-versa
				if ( bgTransparency <= 0.00 ) // Raise the opacity
					animateProcess = "lessTransp";
				if ( bgTransparency >= 0.75 )
					animateProcess = "moreTransp"; // Lower the opacity
				
				// Now, setting the values
				if (animateProcess == "lessTransp")
					bgTransparency = CalculateScaleTransition (bgTransparency, 0.75, "fast-background");
				if (animateProcess == "moreTransp")
					bgTransparency = CalculateScaleTransition (bgTransparency, 0.00, "fast-background");
					
				// And, setting the value to the logo
				DOMLogo_LoadTransict.setAttribute ("opacity", bgTransparency);	
			}
		}, 40);
	}
}