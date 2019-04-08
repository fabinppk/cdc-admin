import React, { Component } from "react";
import InputCustomizado from "../InputCustomizado/InputCustomizado.js";
import PubSub from "pubsub-js";
import TratadorErros from "../../TratadorErros";

class FormularioLivro extends Component {
  constructor(props) {
    super(props);
    this.state = { titulo: "", preco: "", autorId: "" };
    this.setTitulo = this.setTitulo.bind(this);
    this.setPreco = this.setPreco.bind(this);
    this.setAutorId = this.setAutorId.bind(this);
    this.enviaForm = this.enviaForm.bind(this);
  }

  setTitulo(e) {
    this.setState({ titulo: e.target.value });
  }

  setPreco(e) {
    this.setState({ preco: e.target.value });
  }

  setAutorId(e) {
    this.setState({ autorId: e.target.value });
  }

  enviaForm(e) {
    e.preventDefault();

    var titulo = this.state.titulo.trim();
    var preco = this.state.preco.trim();
    var autorId = this.state.autorId;

    PubSub.publish("limpa-erros", {});

    // const URL = "https://cdc-react.herokuapp.com/api/autores";
    const URL = "http://localhost:8080/api/livros";
    let data = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      // mode: "cors",
      body: JSON.stringify({
        titulo: titulo,
        preco: preco,
        autorId: autorId
      })
    };

    fetch(URL, data)
      .then(response => response.json())
      .then(data => {
        if (data.status === 400) {
          new TratadorErros().publicaErros(data);
          return;
        }
        PubSub.publish("atualiza-lista-livros", data);
        this.setState({ titulo: "", preco: "", autorId: "" });
      })
      .catch(error => console.log(error));
  }

  render() {
    var autores = this.props.autores.map(function(autor) {
      return (
        <option key={autor.id} value={autor.id}>
          {autor.nome}
        </option>
      );
    });

    return (
      <div className="pure-form pure-form-aligned">
        <form className="pure-form pure-form-aligned" onSubmit={this.enviaForm}>
          <InputCustomizado
            id="titulo"
            type="text"
            name="titulo"
            value={this.state.titulo}
            onChange={this.setTitulo}
            label="Titulo"
          />

          <InputCustomizado
            id="preco"
            type="text"
            name="preco"
            value={this.state.preco}
            onChange={this.setPreco}
            label="Preço"
          />

          <div className="pure-control-group">
            <label>Autor</label>
            <select
              id="autorId"
              value={this.state.autorId}
              name="autorId"
              onChange={this.setAutorId}
            >
              <option value="">Selecione</option>
              {autores}
            </select>
            <span className="error">{this.state.msgErro}</span>
          </div>

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

class TabelaLivros extends Component {
  render() {
    return (
      <div>
        <table className="pure-table">
          <thead>
            <tr>
              <th>Titulo</th>
              <th>Preço</th>
              <th>Nome</th>
            </tr>
          </thead>
          <tbody>
            {this.props.lista.map(livro => {
              return (
                <tr key={livro.id}>
                  <td>{livro.titulo}</td>
                  <td>{livro.preco}</td>
                  <td>{livro.autor.nome}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

class LivroBox extends Component {
  constructor() {
    super();
    this.state = {
      lista: [],
      autores: []
    };
  }

  componentDidMount() {
    // const URL = "https://cdc-react.herokuapp.com/api/autores";
    const URL = "http://localhost:8080/api/livros";
    const AUTORES = "http://localhost:8080/api/autores";

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
      "atualiza-lista-livros",
      function(topico, lista) {
        this.setState({ lista: lista });
      }.bind(this)
    );

    fetch(AUTORES)
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.setState({ autores: data });
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
  }

  render() {
    return (
      <div>
        <div className="header">
          <h1>Cadastro de Livros</h1>
        </div>
        <div className="content" id="content">
          <FormularioLivro autores={this.state.autores} />
          <TabelaLivros lista={this.state.lista} />
        </div>
      </div>
    );
  }
}

export default LivroBox;
