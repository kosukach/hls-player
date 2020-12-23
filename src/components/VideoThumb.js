import React, { Component } from 'react'
import defaultImage from "../images/defeault.png";

class VideoThumb extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }
    
    render(){
        let props = this.props.data
        return (
            <div className="video-card" >
               <div className="title-container" >
                   <span className="title" title={props.name} onClick={this.props.playVid}>{props.name}</span>
               </div>
               <div className="video-thumbnail" onClick={this.props.playVid}>
                  <img src={props.image? props.image : defaultImage} className="thumbnail" alt="thumbnail" title={props.name}/>
               </div>
            </div>
        )
    }
}

export default VideoThumb;