    $(document).ready(function(){

        $("#searchJob").modal('hide');
        $("#newJob").modal('hide');
    
    	$('.message .close')
			.on('click', function() {
    			$(this)
    				.closest('.message')
    			.transition('fade');
		});
		
		$(".navbar-default .navbar-nav li a").click(function(event) {
					// Removes focus of the anchor link.
					$(this).blur();
						});
						
		// Automatically collapse NAVBAR on mobile devices after
		// selecting a hyperlink
		$('.navbar-collapse a:not(.dropdown-toggle)').click(function(){
		$(this).parents('.navbar-collapse').collapse('hide');
		});
});