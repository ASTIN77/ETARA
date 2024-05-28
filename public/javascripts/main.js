$(document).ready(function() {

  // Fade in ticket views
  
  $("#newJob").fadeTo("slow", 1);
  $("#jobReports").fadeTo("slow", 1);
  
  // Initialise elements defined by Class Names
  // of 'lockDetails' and 'lockFields' as 'read only'
  
  $(".lockDetails, .lockFields").prop('readonly', true);
  
  
  // Disable editing of fields on 'Completed' or 'Cancelled' tickets
  var unlockValue = $("#jobStatus").val();
  
  if (unlockValue == "Completed" || unlockValue == "Cancelled") {
      $(".lockDetails, .lockFields").attr('disabled', true);
      $(".lockUpdates").prop('readonly', true);
      $("#faultNotes, #saveButton").hide();
  }
  
  // Set initial cancelReason box to hidden
  // if job status is 'outstanding' or 'completed'
    var unlockReason = $("#jobStatus").val();
    if(unlockReason == "Completed" || unlockReason == "Outstanding"){
      $('label[for="cancelReason"], #cancelReason').hide();
      $("#isCancelledReason").val() == '';
    }
  
  // Change disabled attributes and remove 'read only' on
  // fields when the unlock button is clicked
  // And toggle between these states.
  
    $("#unlockOptions").click(function() {
      $("#jobStatus, .lockDetails, .lockFields").each(function() { var re = $(this).prop('disabled', true); $(this).prop('disabled', !re); });
      $(".lockFields, .lockUpdates").each(function() { var re = $(this).prop('readonly'); $(this).prop('readonly', !re); });
      $("#faultNotes, #saveButton").toggle();
    });


    $("#jobStatus").change(function(){
      
  // Change field 'cancelReason' to show when status
  // has been changed to 'Cancelled'
      if ($(this).val() == "Cancelled"){
        $('label[for="cancelReason"]').show();
        $("#cancelReason").show();
      }
      
      // Change field 'cancelReason' to show when status
      // has been changed to 'Cancelled'
      if ($(this).val() == "Outstanding" || $(this).val() == "Completed"){
        $('label[for="cancelReason"], #cancelReason').hide();
        $("#isCancelledReason").val("");
      }
    });

   
  // Removes focus on anchor links in navigation bar.    
  $(".navbar-default .navbar-nav li a").click(function(event) {
    $(this).blur();
  });
  
  
});

    


