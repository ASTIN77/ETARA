$(document).ready(function() {

  // Fade in ticket views
  
  $("#newJob").fadeTo("slow", 1);
  
  // Initialise elements defined by Class Names
  // of 'lockDetails' and 'lockFields' as 'read only'
  
  $(".lockDetails").prop('readonly', true);
  $(".lockFields").prop('readonly', true);
  
  
  // Disable editing of fields on 'Completed' or 'Cancelled' tickets
  var unlockValue = $("#jobStatus").val();
  if (unlockValue === "Completed" || unlockValue === "Cancelled") {
      $(".lockDetails").attr('disabled', true);
      $(".lockFields").attr('disabled', true);
      $(".lockUpdates").attr('disabled', true);
      $("#faultNotes").hide();
      $("#saveButton").hide();
  }
  
  // Change disabled attributes and remove 'read only' on
  // fields when the unlock button is clicked
  
    $("#unlockOptions").click(function() {
        $(".lockDetails").attr("disabled", false);
        $(".lockFields").attr("disabled", false);
        $(".lockFields").removeAttr('readonly');
        $(".lockUpdates").attr("disabled", false);
        $("#faultNotes").show();
        $("#saveButton").show();
      });
   
  // Removes focus on anchor links in navigation bar.    
  $(".navbar-default .navbar-nav li a").click(function(event) {
    $(this).blur();
  });
});

    


