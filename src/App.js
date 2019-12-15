import React from 'react';
import ReactPlayer from 'react-player';

import './App.css';

// TODO: make any sound loadable
let phonemesToUrls = {
  m:    'http://k007.kiwi6.com/hotlink/ux44q3wnxe/m.mp3',
  oo:   'http://k007.kiwi6.com/hotlink/a8ix5ud9h0/oo.mp3',
  'silence-long':   'http://k007.kiwi6.com/hotlink/hr0ffasjsw/silence-long.mp3',
  'silence-medium': 'http://k007.kiwi6.com/hotlink/kzz0csfzlg/silence-medium.mp3',
  'silence-short':  'http://k007.kiwi6.com/hotlink/09nzngu30c/silence-short.mp3',
  'silence-none':   'http://k007.kiwi6.com/hotlink/ktvbb4skqy/silence-none.mp3',
};

let silenceShortObj = {
  label:  'silence-short',
  url:    phonemesToUrls[ 'silence-short' ],
};

let silenceMediumObj = {
  label:  'silence-medium',
  url:    phonemesToUrls[ 'silence-medium' ],
};


class App extends React.Component {
  state = {
    playing:          false,
    inputNode:        null,
    outputNodeValue:  '',
    volume:           0.8,
    silenceObj:       silenceShortObj,
    silenceLength:    'short',
    urlIndex:         0,
    urls:             [
      'http://k007.kiwi6.com/hotlink/lmh2vehp22/ah.mp3',
      'http://k007.kiwi6.com/hotlink/d2sa235q8l/aw.mp3',
    ],
  }

  componentDidMount = () => {
    this.setState({
      inputNode:  document.getElementById( 'wordInput' ),
    });
  }

  handleVolumeChange = event => {
    this.setState({ volume: parseFloat(event.target.value) })
  }

  // buildUrls = ( event ) => {
  buildUrls = ( chars, silenceLength ) => {

    let trimmed  = chars.replace( /^\./, '' ).replace( /\.$/, '' );
    let phonemes = trimmed.split('.');

    let urls = [];
    let trackData = [];
    for ( let chars of phonemes ) {
      urls.push( phonemesToUrls[ chars ] );
      trackData.push({
        label:  chars,
        url:    phonemesToUrls[ chars ],
      });

      let silenceObj = this.state.silenceObj;

      // Need at least two sounds to make the
      // loop happen. Otherwise doesn't re-render.
      // Also, consistent spacing between sounds.
      if ( silenceLength !== 'none' ) {
        urls.push( silenceObj.url );
        trackData.push( silenceObj );
      }
    }

    // Extra long silence at the end before looping.
    urls.push( silenceMediumObj.url );
    trackData.push( silenceMediumObj );

    return {
      outputNodeValue:  chars,
      urls:             urls,
    }
  }  // ends onBlur

  // Short pause between syllables
  handlePlayShort = () => {
    // console.log('onPlayShort');
    this.handlePlay( 'short' );
  }

  // No pause between syllables
  handlePlayNone = () => {
    // console.log('onPlayNone');
    this.handlePlay( 'none' );
  }

  handlePlay = ( silenceLength ) => {
    this.setState(( prevState ) => {
      let node = prevState.inputNode;
      let chars = node.value;
      let { outputNodeValue, urls } = this.buildUrls( chars, silenceLength );

      return {
        urlIndex:         0,
        playing:          true,
        outputNodeValue:  outputNodeValue,
        urls:             urls,
        silenceLength:    silenceLength
      }
    });
  }

  handleStop = () => {
    this.setState({ playing: false });
  }

  onEnded = ( overrides ) => {
    // console.log('onEnded');

    this.setState(function (prevState, props) {
      let newIndex = 1 + prevState.urlIndex;
      if ( newIndex >= prevState.urls.length ) {
        newIndex = 0;
      }

      let extraState = {};
      if (overrides) {
        extraState = overrides;
      }

      return {
        urlIndex: newIndex,
        ...extraState,
      }
    });

  }

  render () {

    let { playing, urls, urlIndex, outputNodeValue, volume } = this.state;

    return (
      <div className='player-wrapper'>
        <input
          type    ="text"
          name    ="wordInput"
          id      ="wordInput"
          onBlur  ={ this.onBlur }
        />
        <div id="wordOutput">{ outputNodeValue }</div>
        {playing ?
          <Phonemes
            url     ={ urls[ urlIndex ] }
            volume  ={ volume }
            onEnded ={ this.onEnded }
          />
          : null
        }
        <section>
          <div>
            <span className="control-label">Controls</span>
            <span>
              <button onClick={this.handlePlayShort}>Play Slowly</button>
              <button onClick={this.handlePlayNone}>Play Quickly</button>
              <button onClick={this.handleStop}>Stop</button>
            </span>
          </div>
          <div>
            <span className="control-label">Volume</span>
            <span>
              <input type='range' min={0} max={1} step='any' value={volume} onChange={this.handleVolumeChange} />
            </span>
          </div>
        </section>
      </div>
    );
  }
};  // Ends <extends>



class Phonemes extends React.Component {
  state = {}

  onEnded = () => {
    this.props.onEnded();
  }

  render () {

    return (
      <ReactPlayer
        ref={this.ref}
        className ='react-player'
        width     ='100%'
        height    ='100%'
        url       ={this.props.url}
        volume    ={this.props.volume}
        playing   ={true}
        onReady   ={() => {}/*console.log('onReady')*/}
        onStart   ={() => {}/*this.player.seekTo(0);console.log('onStart');}/*console.log('onStart')*/}
        onPlay    ={() => {}}
        onBuffer  ={() => {}/*console.log('onBuffer')*/}
        onEnded   ={this.onEnded}
        onError   ={(e, other) => console.log('onError', e, other)}
      />
    );
  }
};  // Ends <Phonemes>



export default App;
