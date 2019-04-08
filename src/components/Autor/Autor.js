import React, { Component } from "react";
import InputCustomizado from "../InputCustomizado/InputCustomizado.js";
import PubSub from "pubsub-js";
import TratadorErros from "../../TratadorErros";

class FormularioAutor extends Component {
  constructor() {
    super();
    this.state = {
      nome: "",
      email: "",
      senha: ""
    };

    this.setNome = this.setNome.bind(this);
    this.setEmail = this.setEmail.bind(this);
    this.setSenha = this.setSenha.bind(this);
    this.enviaForm = this.enviaForm.bind(this);
  }

  setNome(e) {
    this.setState({ nome: e.target.value });
  }

  setEmail(e) {
    this.setState({ email: e.target.value });
  }

  setSenha(e) {
    this.setState({ senha: e.target.value });
  }

  enviaForm(e) {
    e.preventDefault();
    PubSub.publish("limpa-erros", {});

    // const URL = "https://cdc-react.herokuapp.com/api/autores";
    const URL = "http://localhost:8080/api/autores";
    let data = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      // mode: "cors",
      body: JSON.stringify({
        nome: this.state.nome,
        email: this.state.email,
        senha: this.state.senha
      })
    };

    fetch(URL, data)
      .then(response => response.json())
      .then(data => {
        if (data.status === 400) {
          new TratadorErros().publicaErros(data);
          return;
        }
        PubSub.publish("atualiza-lista-autores", data);
        this.setState({ nome: "", email: "", senha: "" });
      })
      .catch(error => console.log(error));
  }

  render() {
    return (
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm}>
          <InputCustomizado
            id="nome"
            type="text"
            name="nome"
            value={this.state.nome}
            onChange={this.setNome}
            label="Nome"
          />

          <InputCustomizado
            id="email"
            type="email"
            name="email"
            value={this.state.email}
            onChange={this.setEmail}
            label="Email"
          />

          <InputCustomizado
            id="senha"
            type="password"
            name="senha"
            value={this.state.senha}
            onChange={this.setSenha}
            label="Senha"
          />

          <div className="pure-control-group">
            <label />
            <button type="submit" className="pure-button pure-button-primary">
              Gravar
            </button>
          </div>
        </form>
      </div>
    );
  }
}

class TabelaAutores extends Component {
  render() {
    return (
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>email</th>
            </tr>
          </thead>
          <tbody>
            {this.props.lista.map(autor => {
              return (
                <tr key={autor.id}>
                  <td>{autor.nome}</td>
                  <td>{autor.email}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

class AutorBox extends Component {
  constructor() {
    super();
    this.state = {
      lista: []
    };
  }

  componentDidMount() {
    // const URL = "https://cdc-react.herokuapp.com/api/autores";
    const URL = "http://localhost:8080/api/autores";

    fetch(URL)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.setState({ lista: data });
          });
        } else {
          console.log("Network response was not ok.");
        }
      })
      .catch(function(error) {
        console.log(
          "There has been a problem with your fetch operation: " + error.message
        );
      });

    PubSub.subscribe(
      "atualiza-lista-autores",
      function(topico, lista) {
        this.setState({ lista: lista });
      }.bind(this)
    );
  }

  render() {
    return (
      <div>
        <div className="header">
          <h1>Cadastro de autores</h1>
        </div>
        <div className="content" id="content">
          <FormularioAutor />
          <TabelaAutores lista={this.state.lista} />
        </div>
      </div>
    );
  }
}

export default AutorBox;
