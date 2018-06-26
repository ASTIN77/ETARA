$(document).ready(function() {

  $("#newJob").fadeTo("slow", 1);

  $(".lockFields").prop('readonly', true);
  document.getElementByClass("lockFields").readOnly;

  $(".navbar-default .navbar-nav li a").click(function(event) {
    // Removes focus of the anchor link.
    $(this).blur();
  });
});

