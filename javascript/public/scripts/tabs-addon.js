$(function ()
{

    if ($(".custom-tabs.track-url").length > 0)
    {
        if (location.hash.length > 0)
        {
            if ($(location.hash).length > 0)
            {
                var currentPanel = $(location.hash, $(".custom-tabs.track-url .tab-content"));
                if (!currentPanel.hasClass("active"))
                {
                    $(">.tab-pane", currentPanel.closest(".tab-content")).each(function ()
                    {
                        $(this).removeClass("active");
                    });
                    currentPanel.addClass("active");

                }
                var currentTrigger = $("a[href='" + location.hash + "']", $(".custom-tabs.track-url .nav-tabs")).closest("li");
                $(">li", currentTrigger.closest(".nav-tabs")).removeClass("active");
                currentTrigger.addClass("active");

                var masterContainer = currentPanel.closest(".custom-tabs.track-url");
                if (masterContainer.hasClass("auto-scroll"))
                {
                    $("body,html").animate({scrollTop:masterContainer.offset().top-80},500);
                }
            }

        }
    }



});