import React, { Component } from "react";
import Banner from "./Banner.jsx";
import Festivals from "./Festivals.jsx";
import Playlist from "./Playlist.jsx";
import YourEvents from "./YourEvents.jsx";
import styles from "../app.scss";

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        search: '',
        artists: [],
        user: 'Goblin Shark',
        token: '',
        code: ''
    };
    this.updateArtists = this.updateArtists.bind(this);
  }

  updateArtists (payload) {
   this.setState((state) => { 
     return {...state, artists: payload}
  }, () => console.log(this.state))
}

  render() {
    return (
      <div className="Container">
        <Banner 
          key={'banner'}
          user={this.state.user}
        />
        <Festivals 
          key={'festival'}
          search={this.state.search}
          artists={this.state.artists}
          updateArtists={this.updateArtists}
        />
        <Playlist 
          key={'playlist'}
          artists={this.state.artists}
          updateArtists={this.updateArtists}
          user={this.state.user}
          token={this.state.token}
          code={this.state.code}
        />
        <YourEvents />
      </div>
    );
  }
}

export default Container;