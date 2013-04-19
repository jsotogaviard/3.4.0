/* Preload Images */

var arrPreloadedImages=new Array()
function preloadImages(){
	for (var i=0;i<preloadImages.arguments.length;i++) {
	arrPreloadedImages[i]=new Image();
	arrPreloadedImages[i].src=preloadImages.arguments[i];
	}
}

//Enter path of images to be preloaded inside parenthesis. Extend list as desired.
preloadImages("images/Dessert.png","images/FastFood.png","images/FineDining.png","images/FreshSeafood.png","images/HotDog.png","images/LiquidLunch.png","images/Sausage.png","images/Soup.png","images/TakeOut.png","images/Twitter_Over.png","images/Twitter_Up.png","images/Lunch_Over.png","images/Lunch_Up.png")

