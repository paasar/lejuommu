    window.lejuommu = {};
    window.lejuommu.state = true;
    window.lejuommu.automaticEnabled = false;

    const mute = document.getElementById('mute0');

    window.lejuommu.updateNowPlaying = function() {
        if (!window.lejuommu.automaticEnabled) {
          return;
        }

        fetch('https://listenapi.planetradio.co.uk/api9/initdadi/radio-nova')
          .then(function(response) { return response.json(); })
          .then(function(json) {
            const track = json.stationNowPlaying.nowPlayingTrack;
            document.getElementById('fetch-result').innerHTML = track !== '' ? track : 'Juonto/mainos';
            //console.log(JSON.stringify(json));
            if (track === '') {
              window.lejuommu.switchToRadio();
            } else {
              window.lejuommu.switchToTwitch();
            }
          });
    };

    window.lejuommu.repeatingUpdate = function() {
      console.log('fetching data');
      window.lejuommu.updateNowPlaying();
      setTimeout(window.lejuommu.repeatingUpdate, 10000);
    };

    window.lejuommu.repeatingUpdate();

    window.lejuommu.switchToRadio = function() {
      player.pause();
      if (radio) radio.volume(1);
      mute.style.opacity = 0;
      document.getElementById('current-source').innerHTML = 'Radio';
    };

    window.lejuommu.switchToTwitch = function() {
      if (radio) radio.volume(0);
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
        window.lejuommu.updateNowPlaying();
      });

    document.getElementById('automatic-button').addEventListener('click',
    function() {
      const autoState = document.getElementById('automatic-state');
      if (!window.lejuommu.automaticEnabled) {
        autoState.innerHTML = 'OFF';
      } else {
        autoState.innerHTML = 'ON';
      }
      window.lejuommu.automaticEnabled = !window.lejuommu.automaticEnabled;
    });
