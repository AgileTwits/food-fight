import React from 'react';

class LiveChat extends React.Component {
    constructor(props) {
      super(props);
      this.state = {

      }
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }
    
    scrollToBottom () {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    handleKeyPress(event) {
        if (event.key == 'Enter') {
          this.props.sendMessage();
        }
    }

    handleClick() {
        this.props.sendMessage();
    }

    handleOnChange() {
        this.props.updateMessage();
    }
  
    render() {
  
      return (
        <div id="chat">
                    <h4 className="is-size-4">{this.props.roomName} Chatroom</h4>
                    <div className="chat-messages">
                      {this.props.messages.map(message => {
                        if(this.props.username === message.name) {
                          return (<div style={{textAlign:"right", backgroundColor:"#ffe6e6", borderTop:"1px solid black", padding:"5px"}}><p>{message.message}</p></div>)
                        } else {
                          return (<div style={{textAlign:"left", backgroundColor:"#f0f5f5", borderTop:"1px solid black", padding:"5px"}}><p><strong>{message.name}:</strong> {message.message}</p></div>)
                        }
                      })}
                    </div>
                    <div style={{ float:"left", clear: "both" }}
                      ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                    <div>
                      <span>
                            <input
                              type="text"
                              className="input is-primary is-small is-rounded"
                              value={this.props.message}
                              onChange={this.handleOnChange.bind(this)}
                              onKeyPress={this.handleKeyPress.bind(this)}
                              style={{width:'450px', marginTop:'15px', marginRight:'15px'}}
                            />
                      </span>
                      <button
                        onClick={this.handleClick.bind(this)}
                        className="button is-outlined is-primary is-small send-message"
                        style={{marginTop:'15px'}}
                      >
                        Send
                      </button>
                    </div>
                  </div>
      );
    }
  }
  
  export default LiveChat;