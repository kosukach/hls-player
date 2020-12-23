import React, { Component } from "react"
import { API, graphqlOperation } from "aws-amplify"
import * as queries from "./graphql/queries"
import Hls from "hls.js"
import './App.css';
import VideoThumb from "./components/VideoThumb";

class App extends Component {
  
  constructor(props){
    super(props)
    this.state = {
      currentResource: {
        name: "Resource not loaded",
        isLive: false
      },
      mousedown: false,
      resources: []
    }
    this.togglePlay = this.togglePlay.bind(this)
    this.updateJuice = this.updateJuice.bind(this)
    this.doSeek = this.doSeek.bind(this)
    this.doSkip = this.doSkip.bind(this)
    this.updateVid = this.updateVid.bind(this)
    this.updateVolume = this.updateVolume.bind(this)
    this.playVid = this.playVid.bind(this)
    this.playUrl = this.playUrl.bind(this)
    this.pauseLive = this.pauseLive.bind(this)
  }

  async componentDidMount(){
    await API.graphql(graphqlOperation(queries.aliasQuery)).then(
      res => {
        this.setState({
          resources: res.data.resources.items,
          currentResource: res.data.live
        })
      }
    )
      
    this.loadVid(this.state.currentResource);
    
  }

  loadVid(resource){
    const video = document.getElementById('video');
    
    const loading = document.getElementById("loading");
    loading.style.display = "inline-block";
    if(Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(resource.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, ()=>{
        loading.style.display = "none";
        video.style.display = "inline-block";
        video.currentTime = 0;
        video.play();
      })
    }
  }

  togglePlay(){
    const btn = document.getElementById("toggle");
    const video = document.getElementById("video");
    if (video.paused) {
      btn.className = "pause";
      video.play();
    } else {
      btn.className = "play";
      video.pause();
      if(this.state.currentResource.isLive){this.pauseLive()}
    }

  }

  pauseLive(){
    const liveIcon = document.getElementById("live-icon");
    liveIcon.style.background = "rgba(150, 150, 150, 0.67)";
    liveIcon.children[0].innerHTML = "Skip To Live";

    const skipToLive = () =>{
      liveIcon.style.background = "rgba(226, 18, 18, 0.67)";
      liveIcon.children[0].innerHTML = "Live";
      this.loadVid(this.state.currentResource);
      liveIcon.removeEventListener("click", skipToLive);
    }

    liveIcon.addEventListener("click", skipToLive)
    
  }

  updateJuice(){
    const juice = document.getElementById("juice");
    const video = document.getElementById("video");
    const time = document.getElementById("time");
    const duration = video.duration 
    const currentTime = video.currentTime
    const juicePos = currentTime / duration;
    juice.style.width = `${juicePos*100}%`;
    let current = parseInt(currentTime);
    let total = parseInt(duration);
    const currentHour = parseInt(current/3600);
    current = current % 3600;
    const currentMinute = current/60 > 10 ? parseInt(current/60) : "0" + parseInt(current/60) 
    current = current % 60;
    const currentSecond = current > 10 ? current : "0" + current;
    const currentTimeParsed = currentHour ?  `${currentHour}:${currentMinute}:${currentSecond}` : `${currentMinute}:${currentSecond}`
    const totalHour = parseInt(total/3600);
    total = total % 3600;
    const totalMinute = total/60 > 10 ? parseInt(total/60) : "0" + parseInt(total/60) 
    total = total % 60;
    const totalSecond = total > 10 ? total : "0" + total;
    const totalTimeParsed = totalHour ?  `${totalHour}:${totalMinute}:${totalSecond}` : `${totalMinute}:${totalSecond}`

    time.innerHTML = `${currentTimeParsed}/${totalTimeParsed}`

  }

  updateVolumeJuice(){
    const volumeJuice = document.getElementById("volume-juice");
    const video = document.getElementById("video");
    volumeJuice.style.width = `${video.volume*100}%`
  }

  doSeek(e, updateFunc, barName){
    e.preventDefault();
    let container = document.getElementById("video-container");
    let bar = document.getElementById(barName);
    this.setState({mousedown: true});
    function trackMouse(e){
      mouseX = (e.pageX  - (container.offsetLeft + bar.offsetLeft)) / bar.offsetWidth;
    }
    document.addEventListener("mousemove", trackMouse);
    document.addEventListener("mouseup", this.doSkip);
    var mouseX = (e.pageX  - (container.offsetLeft)) / container.offsetWidth;
    let follow = setInterval(() => {
      if(this.state.mousedown){
        updateFunc(mouseX)
      } else {
        document.removeEventListener("mousemove", trackMouse);
        document.removeEventListener("mouseup", this.doSkip);
        clearInterval(follow);
      }
    })
  }

  doSkip(){
    this.setState({mousedown: false});
  }

  updateVid(mouseX){
    const video = document.getElementById("video");
    video.currentTime = mouseX * video.duration;
    this.updateJuice(); 
  }
  
  updateVolume(mouseX){
    const video = document.getElementById("video");
    const vol = Math.min(Math.max(mouseX, 0), 1)
    video.volume = vol;
    this.updateVolumeJuice();
  }

  playVid(resource){

    const btn = document.getElementById("toggle");
    btn.className = "pause";
    
    const left = this.state.resources.filter(reso => reso.id !== resource.id)

    if(this.state.currentResource.id !== 0){left.push(this.state.currentResource);}
    this.loadVid(resource);
    this.setState({
      currentResource: resource,
      resources: left
    });

    window.scrollTo(0, 0);
  }

  playUrl(){
    const url = document.getElementById("url-input").value;
    const customResource = {
      url: url,
      name: "Your custom video",
      isLive: false,
      id: 0
    }
    const left = this.state.resources;
    left.push(this.state.currentResource);
    this.loadVid(customResource);
    this.setState({
      currentResource: customResource,
      resources: left
    })
  }

  render(){
    const live = this.state.currentResource.isLive ;
    if(live){document.getElementById("juice").style.width = 0}

    return (
      <div className="App">
        <div id="header">
          <input id="url-input" placeholder="Enter your own HLS url"></input>
          <button id="parse-button" onClick={this.playUrl}>Parse</button>
        </div>
        <div id="main">
          
          <div id="video-title">
            <p id="current-title">{this.state.currentResource.name}</p>
          </div>

          <div id="video-container" 
            onMouseEnter={live ? ()=>{document.getElementById("live-icon").style.display = "block"} : null}
            onMouseLeave={live ? ()=>{document.getElementById("live-icon").style.display = "none"} : null}
          >
            <div id="loading">
              <h3>Loading...</h3>
            </div>
            <video id="video" onClick={this.togglePlay} onTimeUpdate={live ? null : this.updateJuice }></video>
            <div id="live-icon">
              <p className="live-text">Live</p>
            </div>
            <div className="controls">
              <div id="bar" onMouseDown={live ? null : (e)=>this.doSeek(e, this.updateVid, "bar") }>
                <div id="juice"></div>
              </div>
              <div className="buttons">
                <button id="toggle" onClick={this.togglePlay}></button>
              </div>
              <div id="time-container">
                <p id="time">{live ? null : "00:00/00:00"}</p>
              </div>
              <div id="volume-container">
                <div id="volumeIcon"></div>
                <div id="volume-bar" onMouseDown={(e)=>this.doSeek(e, this.updateVolume, "volume-bar")}>
                  <div id="volume-juice"></div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
        <div id="footer">
          <div id="footer-container">
            {this.state.resources.map(reso => {
              return <VideoThumb data={reso} key={reso.id} id={reso.id} playVid={()=>this.playVid(reso)}></VideoThumb>
            })}
          </div>
        </div>
      </div>
    );

  }
}

export default App;
