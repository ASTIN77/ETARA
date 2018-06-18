    $(document).ready(function(){

        $("#newJob").fadeTo("slow", 1);
    
    	/*document.getElementById("faultNotesReadOnly").readOnly = true;*/
		
		$(".navbar-default .navbar-nav li a").click(function(event) {
					// Removes focus of the anchor link.
					$(this).blur();
						});
});

