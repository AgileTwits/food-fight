import React from 'react';
import io from 'socket.io-client';
import $ from 'jquery';
import Tock from 'tocktimer';
import RestaurantList from './RestaurantList.jsx';
import CurrentSelection from './CurrentSelection.jsx';

class Room extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      message: '',
      messages: [],
      members: [],
      zipcode: undefined,
      currentSelection: undefined,
      currentSelectionName: undefined,
      isNominating: true,
      votes: [],
      roomName: '',
      timer: '',
      // The hasVoted functionality has not yet been implemented
      hasVoted: false,
    };
    //remove
    console.log('JOSEPH', process.env.PORT);
    this.roomID = this.props.match.params.roomID;

    this.nominateRestaurant = this.nominateRestaurant.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.voteApprove = this.voteApprove.bind(this);
    this.voteVeto = this.voteVeto.bind(this);

    // Client-side socket events
    // NEED THIS TO WORK ON DEPLOYMENT
    this.socket = io({transports: ['websocket']});
    // SERIOUSLY NEED ABOVE FOR DEPLOYMENT
    //DO NOT NEED TO SPECIFY PORT ON CLIENT SIDE
    this.socket.on('chat', message => {
      if (message.roomID === this.roomID) {
        console.log('Received message', message);
        this.setState({
          messages: [...this.state.messages, message.message],
        });
        this.getMessages();
      }
    });
    this.socket.on('vote', roomID => {
      if (roomID === this.roomID) {
        console.log('Received vote');
        this.getVotes();
      }
    });

    this.socket.on('veto', roomID => {
      if (roomID === this.roomID) {
        console.log('Received veto');
        this.getVotes();
      }
    });

    this.socket.on('nominate', nominee => {
      if (nominee.roomID === this.roomID) {
        console.log('Received nomination', nominee);
        this.setState({
          currentSelection: nominee.restaurant,
          hasVoted: false,
        });
      }
    });

    this.socket.on('join', roomID => {
      if (roomID === this.roomID) {
        console.log('Received new member');
        if (this.state.currentSelection) {
          this.socket.emit('nominate', {'restaurant': this.state.currentSelection, 'roomID': this.roomID});
        }
      }
    })
  }

  /// Send post request to server to fetch room info when user visits link
  componentDidMount() {
    this.getMessages();
    this.getRoomInfo();
    this.getTimer();
    this.getVotes();
    this.socket.emit('join', this.roomID);
  }

  getMessages() {
    $.get(`/api/messages/${this.roomID}`).then(messages => {
      this.setState({
        messages: messages,
      });
    });
  }

  getRoomInfo() {
    $.get(`/api/rooms/${this.roomID}`).then(roomMembers => {
      console.log(`Got roommembers: ${JSON.stringify(roomMembers)} from ${this.roomID}`)
      this.setState({
        members: roomMembers,
        zipcode: roomMembers[0].rooms[0].zipcode,
        roomName: roomMembers[0].rooms[0].name,
      });
    });
  }

  getTimer() {
    $.get(`/api/timer/${this.roomID}`).then(timer => {
      let tock = new Tock({
        countdown: true,
        interval: 100,
        callback: () => {
          let time = tock.lap()
          let seconds = (Math.floor((time / 1000) % 60));
          let minutes = (Math.floor((time / (60000)) % 60));
          seconds = (seconds < 10) ? "0" + seconds : seconds;
          minutes = (minutes < 10) ? "0" + minutes : minutes;

          this.setState({
            timer: minutes + ':' + seconds
          })
        }
      });
      console.log('STARTING TIMER');
      tock.start(timer.timeLeft);
    });
  }

  getVotes() {
    $.get(`/api/votes/${this.roomID}`).then(restaurants => {
      this.setState({
        votes: restaurants,
      });
      if (restaurants.length && !this.state.currentSelection) {
        restaurants.forEach(restaurant => {
          if (!restaurant.vetoed) {
            this.setState({
              currentSelectionName: restaurant.name,
            });
          }
        });
      }
    });
  }

  // Activated on click of RestaurantListItem component
  nominateRestaurant(restaurant, reloading = false) {
    if (this.state.isNominating) {
      this.setState({
        currentSelection: restaurant,
        isNominating: false,
      });
      if (!reloading) {
        let voteObj = {
          name: restaurant.name,
          roomID: this.roomID,
          restaurantID: restaurant.id,
        };
        console.log('vote', voteObj)
        let nomObj = {
          restaurant: restaurant,
          roomID: this.roomID,
        };
        $.post('/api/nominate', voteObj).then(() => {
          this.socket.emit('nominate', nomObj);
        });
      }
      // A user who nominates a restaurant should automatically vote for it
      // Socket is not refreshing table for some reason but still sends vote
      this.voteApprove(restaurant.name, restaurant.id);
    }
  }

  sendMessage() {
    console.log(this.props.username)
    let messageObj = {
      message: {
        name: this.props.username || this.state.name,
        message: this.state.message,
      },
      roomID: this.roomID,
    };
    $.post('/api/messages', messageObj).then(() => {
      this.socket.emit('chat', messageObj);
    });
  }

  // Update from text boxes in the live chat
  updateName(e) {
    this.setState({
      name: e.target.value,
    });
  }

  updateMessage(e) {
    this.setState({
      message: e.target.value,
    });
  }

  voteApprove(name, id) {
    let resName = name || this.state.currentSelection.name;
    let resId = id || this.state.currentSelection.id;
    let voteObj = {
      voter: this.props.username,
      restaurant_id: resId,
      name: resName,
      roomID: this.roomID,
    };
    $.post('/api/votes', voteObj).then(() => {
      this.socket.emit('vote', voteObj);
    });
    this.setState({
      hasVoted: true,
    });
  }

  voteVeto() {
    let resId = this.state.currentSelection.id;
    this.setState({
      isNominating: true,
    });
    if (this.state.currentSelection) {
      let voteObj = {
        voter: this.props.username,
        restaurant_id: resId,
        name: this.state.currentSelection.name,
        roomID: this.roomID,
      };
      console.log('INSIDE', voteObj)
      $.post('/api/vetoes', voteObj).then(() => {
        this.setState({
          currentSelection: undefined,
          hasVoted: true,
        });
        this.socket.emit('veto', voteObj);
      });
    }
  }

  render() {
    let restaurantList = this.state.zipcode ? (
      <RestaurantList zipcode={this.state.zipcode} nominate={this.nominateRestaurant} currentName={this.currentSelectionName}/>
    ) : (
        ''
      );
    let currentSelection = (this.state.currentSelection && !this.state.isNominating) ? (
      <CurrentSelection restaurant={this.state.currentSelection} />
    ) : (
        <div>Please nominate a restaurant</div>
      );
    return (
      <div>
        <section className="hero is-primary">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                Welcome to Room {this.state.roomName}
              </h1>
              <h2 className="subtitle">
                <div>
                  Fighters: {this.state.members.map((user, index) => <span key={index}>{user.email} </span>)}
                </div>
                <div>Zipcode: {this.state.zipcode}</div>
              </h2>
            </div>
          </div>
        </section>
        <div className="columns">
          <div
            className="tile is-ancestor"
            style={{ marginTop: '15px' }}>
            <div className="column is-6">
              <div className="tile is-parent">
                {/* <div className="is-divider" /> */}
                <article className="tile is-child notification">
                  <div id="yelp-list">
                    <p className="title">Local Restaurants</p>
                    {restaurantList}
                  </div>
                </article>
              </div>
            </div>
            <div className="column">
              <div className="tile is-parent is-vertical">
                <article className="tile is-child notification">
                  <div id="current-restaurant">
                    <p className="title">Time Remaining: {this.state.timer}</p>
                    <p className="title">Current Selection</p>
                    {currentSelection}
                    <button onClick={() => this.voteApprove()} className="button is-success">
                      Approve
            </button>
                    <button onClick={this.voteVeto} className="button is-danger">
                      Veto
            </button>
                    <div>
                      <h3>Scoreboard</h3>
                      <table className="table is-striped is-bordered is-fullwidth">
                        <thead>
                          <th>Restaurant</th>
                          <th>Votes</th>
                        </thead>
                        <tbody>
                          {this.state.votes
                            .sort((a, b) => {
                              return b.votes - a.votes;
                            })
                            .map((restaurant, index) => (
                              // <h5 style={{ backgroundColor: restaurant.vetoed ? 'white' : 'lightgrey' }}>
                              //   <strong>{restaurant.name}</strong> {restaurant.votes}
                              // </h5>
                              <tr key={index}>
                                <td>{restaurant.name}</td>
                                <td>{restaurant.votes}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </article>
                <article className="tile is-child notification">
                  <div id="chat">
                    <h4 className="is-size-4">Live Chat</h4>
                    <div>
                      Name{' '}
                      <input
                        type="text"
                        className="input"
                        value={this.state.name}
                        onChange={this.updateName.bind(this)}
                      />
                    </div>
                    <span>
                      Message{' '}
                      <input
                        type="text"
                        className="input"
                        value={this.state.message}
                        onChange={this.updateMessage.bind(this)}
                      />
                    </span>
                    <button
                      onClick={this.sendMessage.bind(this)}
                      className="button is-outlined is-primary is-medium send-message"
                    >
                      Send
            </button>
                    <div className="chat-messages">
                      {this.state.messages.map(message => (
                        <p>
                          <strong>{message.name}:</strong> {message.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default Room;
