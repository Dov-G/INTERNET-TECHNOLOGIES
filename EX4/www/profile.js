
$( document ).ready(function() {

$("#calcInput").keyup(function(event){ 
	var regex = new RegExp(/[^0-9]/g);
    if (this.value.match(regex))
	{
        this.value = this.value.slice(0,this.value.length-1);//replace(regex, '');
	}
});

$("#send").click(function(){
	if (($("#user").val() == $("#password").val()) && ($("#user").val() == "admin"))
	{
		priviewCalculator();
		a = new Calculator("#addButton","#multButton","#clearButton","#settingsButton","#screen","#calcInput");
		SetCalcStyle();
	}
});


function priviewCalculator()
{
	$("#bodyMain").hide();
	$("#calculator").show();
};

//class Calculator

function Calculator(addButton, multButton, clearButton, settingsButton, screen, calcInput)
	{
		var addButton = addButton;
		var multButton = multButton;
		var clearButton = clearButton;
		var settingsButton = settingsButton;
		var screen = screen;
		var calcInput = calcInput;
		var defaultVal = '0';

		var str5="#calcInput";
		
		var addFunc=function ()
		{
			//$(str5).val("haha");
			$(screen).val(parseFloat($(screen).val()) + parseFloat($(calcInput).val()));
		};
		this.multFunc=function ()
		{
			$(screen).val(parseFloat($(screen).val()) * parseFloat($(calcInput).val()));
		};
		this.clearFunc=function clearFunc()
		{
			$(screen).val(defaultVal);
			$(calcInput).val(0);
		};
		this.settingFunc =function ()
		{
			var newDefault = prompt("Enter default result:","0");
			var regex = new RegExp(/[^0-9]/g);
			if ((newDefault!=null) && (!newDefault.match(regex)))
			{
				defaultVal = newDefault;
			}
			else{
				alert("Not a number!");
			}
		};
		$(addButton).click(addFunc);
		$(multButton).click(this.multFunc);
		$(clearButton).click(this.clearFunc);
		$(settingsButton).click(this.settingFunc);
		$(calcInput).keypress(this.calcInputFunc);
		return this;
	}


	

	

	

	
function calcInputFunc()
	{ 
	var regex = new RegExp(/[^0-9]/g);
    if (this.calcInput.value.match(regex))
	{
        this.calcInput.value = this.calcInput.value.replace(regex, '');
	}
	};

//End of class??


  
function SetCalcStyle()
{
	$("#addButton").css({
                "position": "absolute",
                "top": "50%",
                "left": "42%"
            });
	$("#multButton").css({
                "position": "absolute",
                "top": "50%",
                "left": "52%"
            });
	$("#clearButton").css({
                "position": "absolute",
                "top": "40%",
                "left": "52%"
            });
	$("#settingsButton").css({
                "position": "absolute",
                "top": "40%",
                "left": "42%"
            });
	$("#screen").css({
                "position": "absolute",
                "top": "24%",
                "left": "41%"
            });
	$("#calcInput").css({
                "position": "absolute",
                "top": "60%",
                "left": "41%"
            });
	$("#dontPush").css({
				"position": "absolute",
                "top": "70%",
                "left": "45%"
            });
}

$("#dontPush").click(function()
{
	height =$( window ).height();
	width =$( window ).width();
	$("#addButton").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
	$("#multButton").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
	$("#clearButton").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
	$("#settingsButton").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
	$("#screen").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
	$("#calcInput").animate({ top: Math.floor((Math.random()*width)), left: Math.floor((Math.random()*height)) });
});
});