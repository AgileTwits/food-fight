import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


class UserRooms extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rooms: [{"room_id":30,"room_uniqueid":"38fc175c6648d0ef9aaf8aa5ebcec566","room_name":"aa"},{"room_id":48,"room_uniqueid":"fa75c4bbb49954bcad78468cbbd6c106","room_name":"asdf"},{"room_id":67,"room_uniqueid":"b2995abaf6d4eb07ab0c0b47f1b1bda5","room_name":"q "},{"room_id":73,"room_uniqueid":"42a0be839438b0eea26fc64590c66394","room_name":"asldkjf"},{"room_id":84,"room_uniqueid":"0d77ec21a36dbcbc75a22527e4937934","room_name":"asdf"}]
    }
  }

  componentDidMount() {
    
  }

  render() {

    return (
        <article className="tile is-child notification">
        <div className="content">
          <p className="title">Current Fights</p>
          {this.state.rooms.map((room, index) => {
              return <div key={index}>
                      <Link to={`/rooms/${room.room_uniqueid}`} style={{ textDecoration: 'none' }}><button
                      className="button is-outlined is-primary is-small send-message is-fullWidth"
                      style={{width: "100%", margin: "1px"}}>
                      {room.room_name}
                      </button></Link>
                    </div>;
          })}
        </div>
      </article >
    );
  }
}

export default UserRooms;