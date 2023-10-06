const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')

var admin = require("firebase-admin");
var serviceAccount = require("./aula29-09-firebase-adminsdk-sn93a-7596150997.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = getFirestore();

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req,res){
  res.render("primeira_pagina")
})

app.listen(8081, function(){
  console.log("teste")
})

app.get("/consulta", function(req, res){
  var agendamentos = []
  db.collection('agendamentos').get().then((snapshot) => {
    snapshot.forEach((doc) => {
      agendamentos.push({ id: doc.id, ...doc.data() })
    })
    res.render("consulta", { post: agendamentos })
  }).catch((error) => {
    console.error("Erro ao consultar agendamentos: ", error)
  })
})

app.get("/editar/:id", function(req, res){
  var id = req.params.id
  db.collection('agendamentos').doc(id).get().then((doc) => {
    if (doc.exists) {
      res.render("editar", { agendamento: doc.data(), id: id })
    } else {
      res.status(404).send("Agendamento não encontrado")
    }
  }).catch((error) => {
    console.error("Erro ao buscar agendamento para edição: ", error)
  })
})

app.get("/excluir/:id", function(req, res){
  var id = req.params.id
  db.collection('agendamentos').doc(id).delete().then(() => {
    console.log("Agendamento excluído com sucesso")
    res.redirect("/consulta")
  }).catch((error) => {
    console.error("Erro ao excluir agendamento: ", error);
  })
})

app.post("/cadastrar", function(req, res){
  db.collection('agendamentos').add({
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  }).then(function(){
    console.log("Cadatro realizado")
    res.redirect("/")
  })
  
})

app.post("/atualizar", function(req, res){
  var id = req.body.id
  var updatedData = {
    nome: req.body.nome,
    telefone: req.body.telefone,
    origem: req.body.origem,
    data_contato: req.body.data_contato,
    observacao: req.body.observacao
  }
  db.collection('agendamentos').doc(id).update(updatedData).then(() => {
    console.log("Agendamento atualizado com sucesso")
    res.redirect("/consulta")
  }).catch((error) => {
    console.error("Erro ao atualizar agendamento: ", error)
  });
})