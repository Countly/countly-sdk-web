$( document ).ready(function() {
    jQuery.expr[':'].Contains = function(a,i,m){
        return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
    };
    //on search
    $("#nav-search").on("keyup", function(event) {
        if (!$(this).val()) {
            //no search, show all results
            $("nav > ul > li").show();
            
            if(typeof hideAllButCurrent === "function"){
                //let's do what ever collapse wants to do
                hideAllButCurrent();
            }
            else{
                //menu by default should be opened
                $("nav > ul > li > ul li").show();
            }
        }
        else{
            //we are searching
            //show all parents
            $("nav > ul > li").show();
            //hide all results
            $("nav > ul > li > ul li").hide();
            //show results matching filter
            $("nav > ul > li > ul").find("a:Contains("+$(this).val()+")").parent().show();
            //hide parents without children
            $("nav > ul > li").each(function(){
                if($(this).children("ul").length === 0){
                    //has no child at all
                    $(this).hide();
                }
                else if($(this).find("ul").children(':visible').length == 0){
                    //has no visible child
                    $(this).hide();
                }
            });
        }
    });
});