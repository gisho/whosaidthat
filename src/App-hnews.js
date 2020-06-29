import React from "react";


export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            items: []
        };
    }

    refreshData() {
        fetch("https://0c07s6acy2.execute-api.us-east-1.amazonaws.com/Prod/")
            .then(res => res.json())
            .then(
                (result) => {
                    console.log("loaded");
                    this.setState({
                        isLoaded: true,
                        items: result
                    });
                },
                (error) => {
                    this.setState({
                        isLoaded: true,
                        error
                    });
                }
            )
    }

    componentDidMount() {
        this.refreshData();
    }

    vote(event, id) {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"id": id})
        };
        console.log(requestOptions);
        fetch('https://0c07s6acy2.execute-api.us-east-1.amazonaws.com/Prod/vote', requestOptions)
            .then(response => response.json())
            .then(data => {
                this.refreshData()
            });
        event.preventDefault();

    }

    render() {

        const {error, isLoaded, items} = this.state;
        if (error) {
            return <div>Error: {error.message}</div>;
        } else if (!isLoaded) {
            return <div>Loading...</div>;
        } else {
            return (
                <div className="container newsdiv">
                    {items.map((item, ind) => (
                        <div className="row">
                            <div className="col-12 newscol">
                                {ind + 1}.
                                <a onClick={(e) => this.vote(e, item.id)} href="#vote"> <img src={"arrow.gif"}
                                                                                             className="votearrow"
                                                                                             alt={"upvote"}/> </a>
                                <a href={item.url}> {item.title} </a>
                                <span className="points"> {item.score} points </span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }
    }
}