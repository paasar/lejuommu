    window.lejuommu = {
      state: true,
      automaticChanging: true,
      };

    const mute = document.getElementById('mute0');

    window.lejuommu.updateNowPlaying = function(shouldChangeChannel) {
        console.log('fetching data');

        fetch('https://listenapi.planetradio.co.uk/api9/initdadi/radio-nova')
          .then(function(response) { return response.json(); })
          .then(function(json) {
            const track = json.stationNowPlaying.nowPlayingTrack;
            const artist = json.stationNowPlaying.nowPlayingArtist;
            document.getElementById('fetch-result').innerHTML =
              track !== '' ? track + ' by ' + artist : 'Host(s) talking / advertisement';

            if (shouldChangeChannel) {
              if (track === '') {
                window.lejuommu.switchToRadio();
              } else {
                window.lejuommu.switchToTwitch();
              }
            }
          });
    };

    window.lejuommu.repeatingUpdate = function() {
      window.lejuommu.updateNowPlaying(window.lejuommu.automaticChanging);
      setTimeout(window.lejuommu.repeatingUpdate, 3000);
    };

    window.lejuommu.repeatingUpdate();

    window.lejuommu.switchToRadio = function() {
      player.pause();
      radio.volume(0.6);
      mute.style.opacity = 0;
      document.getElementById('current-source').innerHTML = 'Radio';
    };

    window.lejuommu.switchToTwitch = function() {
      radio.volume(0);
      mute.style.opacity = 1;
      player.play();
      document.getElementById('current-source').innerHTML = 'Twitch';
    };

    document.getElementById('switch-button').addEventListener('click',
      function() {
        if (!window.lejuommu.state) {
          window.lejuommu.switchToRadio();
        } else {
          window.lejuommu.switchToTwitch();
        }
        window.lejuommu.state = !window.lejuommu.state;
      });

    document.getElementById('fetch-button').addEventListener('click',
      function() {
        window.lejuommu.updateNowPlaying(false);
      });

    document.getElementById('automatic-button').addEventListener('click',
    function() {
      const autoState = document.getElementById('automatic-state');

      if (window.lejuommu.automaticChanging) {
        autoState.innerHTML = 'OFF';
      } else {
        autoState.innerHTML = 'ON';
      }

      window.lejuommu.automaticChanging = !window.lejuommu.automaticChanging;
    });
