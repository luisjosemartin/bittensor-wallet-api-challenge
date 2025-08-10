/* eslint-disable import/first */
// import "module-alias/register"
import moduleAlias from "module-alias"

moduleAlias.addAliases({
  "#": __dirname,
})

import ExpressServer from "#/providers/Server/ExpressServer"

const server = new ExpressServer()

server.init()
