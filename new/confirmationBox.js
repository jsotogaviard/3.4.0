/* CONFIRMATION BOX LIBRARY */

//the variable to hold the confirmation box DIV
var divConfirmationBox;
var confirmationBox_OKCall;
var confirmationBox_CancelCall;

function confirmationBox_show(strPrompt,strTitle,strOKPrompt, strCancelPrompt,OKFunction,CancelFunction) 
{
    dbAlert("in confirmationBox_show",4);
    //Defaults
    if (strPrompt==null){strPrompt="Would you like to confirm or cancel this action?";}
    if (strTitle==null){strTitle="Confirmation";}
    if (strOKPrompt==null){strOKPrompt="Confirm";}
    if (strCancelPrompt==null){strCancelPrompt="Cancel";}
    
    //create the hidden DIV to hold the confirmation box on load
    if (divConfirmationBox==null)
    {
        var divConfirmationBox=document.createElement("div");
        divConfirmationBox.setAttribute("id","divConfirmatonPopup");
        divConfirmationBox.setAttribute("style","display:none;background-color:#333;text-align:center;position:absolute;width:1px;height:1px;top:80px;left:10px;border-radius:10px;opacity:.8;border: solid 3px #aaa;font-size:14pt;overflow:hidden;");

        document.getElementsByTagName("body").item(0).appendChild(divConfirmationBox);
    }
    
    //set the confirmation box actions
    confirmationBox_OKCall=OKFunction;
    confirmationBox_CancelCall=CancelFunction;
    
    var tmpPopupHTML = "<table width='300' height='150'><tr><td colspan='2' valign='top'><span style='font-weight:bold;'>"+strTitle+"</span></td></tr><tr><td colspan='2' valign='middle'><textarea id='txtEntry' style='width:280px;resize:none;font-face:arial;'>"+strPrompt+"</textarea></td></tr>";
    tmpPopupHTML += "<tr><td valign='bottom' align='middle' width='50%' ontouchstart='eval(confirmationBox_OKCall);confirmationBox_hide();'    ><div style='border-radius:10px;opacity:.95;border: solid 3px #aaa;background-color:#000;font-weight:bold;padding-top:10px;padding-bottom:10px;margin-bottom:10px;'>"+strOKPrompt+"</div></td>";
    tmpPopupHTML += "<td valign='bottom' align='middle' width='50%' ontouchstart='eval(confirmationBox_CancelCall);confirmationBox_hide();'><div style='border-radius:10px;opacity:.95;border: solid 3px #aaa;background-color:#000;font-weight:bold;padding-top:10px;padding-bottom:10px;margin-bottom:10px;'>"+strCancelPrompt+"</div></td></tr></table>";

    document.getElementById("divConfirmatonPopup").innerHTML=tmpPopupHTML;
    document.getElementById("divConfirmatonPopup").style.width="300px";
    document.getElementById("divConfirmatonPopup").style.height="150px";
    document.getElementById("divConfirmatonPopup").style.display="block";  
	document.getElementById("txtEntry").focus();	
}

function confirmationBox_hide() 
{
    confirmationBox_OKCall=null;
    confirmationBox_CancelCall=null;
    document.getElementById("divConfirmatonPopup").style.display="none";
}

function dbAlert() {}
