import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Home from "./components/Home/Home";
import AutorBox from "./components/Autor/Autor";
import LivroBox from "./components/Livro/Livro";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <Router>
    <App>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/autor" component={AutorBox} />
        <Route path="/livro" component={LivroBox} />
      </Switch>
    </App>
  </Router>,
  document.getElementById("root")
);
serviceWorker.unregister();
