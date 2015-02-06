$(document).ready(function(){

  var myPlaylist = new jPlayerPlaylist({
    jPlayer: "#jplayer_N",
    cssSelectorAncestor: "#jp_container_N"
  }, [
    {
      title:"Busted Chump",
      artist:"ADG3",
      mp3:"musics/adg3com_bustedchump.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Chucked Knuckles",
      artist:"3studios",
      mp3:"musics/adg3com_chuckedknuckles.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Cloudless Days",
      artist:"ADG3 Studios",
      mp3:"musics/adg3com_cloudlessdays.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Core Issues",
      artist:"Studios",
      mp3:"musics/adg3com_coreissues.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Cryptic Psyche",
      artist:"ADG3",
      mp3:"musics/adg3com_crypticpsyche.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Electro Freak",
      artist:"Studios",
      mp3:"musics/adg3com_electrofreak.mp3",
      poster: "images/m0.jpg"
    },
    {
      title:"Freeform",
      artist:"ADG",
      mp3:"musics/adg3com_freeform.mp3",
      poster: "images/m0.jpg"
    }
  ], {
    playlistOptions: {
      enableRemoveControls: true,
      autoPlay: true
    },
    swfPath: "js",
    supplied: "webmv, ogv, m4v, oga, mp3",
    smoothPlayBar: true,
    keyEnabled: true,
    audioFullScreen: false
  });
  
  $(document).on($.jPlayer.event.pause, myPlaylist.cssSelector.jPlayer,  function(){
    $('.musicbar').removeClass('animate');
    $('.jp-play-me').removeClass('active');
    $('.jp-play-me').parent('li').removeClass('active');
  });

  $(document).on($.jPlayer.event.play, myPlaylist.cssSelector.jPlayer,  function(){
    $('.musicbar').addClass('animate');
  });

  $(document).on('click', '.jp-play-me', function(e){
    e && e.preventDefault();
    var $this = $(e.target);
    if (!$this.is('a')) $this = $this.closest('a');

    $('.jp-play-me').not($this).removeClass('active');
    $('.jp-play-me').parent('li').not($this.parent('li')).removeClass('active');

    $this.toggleClass('active');
    $this.parent('li').toggleClass('active');
    if( !$this.hasClass('active') ){
      myPlaylist.pause();
    }else{
      var i = Math.floor(Math.random() * (1 + 7 - 1));
      myPlaylist.play(i);
    }
    
  });

});