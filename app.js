'use strict'
const express = require('express')
const helmet = require('helmet')
const ejs = require('ejs')
const path = require('path')
const util = require('util')
const fs = require('fs')
const PkgReader = require('reiko-parser')
const port = process.env.PORT || 8080

const readdirAsync = util.promisify(fs.readdir)
const parsePackageAsync = function(path) {
	const reader = new PkgReader(path, 'ipa', { withIcon: true })

	return new Promise((resolve, reject) => {
		reader.parse((err, pkgInfo) => {
			if (err) {
				reject(err)
				return
			}

			resolve(pkgInfo)
		})
	})
}

async function main() {
	console.log('Searching for packages...')
	const ipaFiles = await readdirAsync(path.join(__dirname, 'apps'))

	console.log('Parsing packages...')

	const apps = await Promise.all(ipaFiles.map(async ipa => {
		const ipaPath = path.join(__dirname, 'apps', ipa)
		const pkgInfo = await parsePackageAsync(ipaPath)

		return {
			fileName: ipa,
			icon: pkgInfo.icon || 'https://via.placeholder.com/120',
			title: pkgInfo.CFBundleDisplayName || pkgInfo.CFBundleName,
			pkgInfo: pkgInfo
		}
	}))

	const appLookup = apps.reduce((lut, app) => {
		lut[app.fileName] = app.pkgInfo
		return lut
	}, {})

	console.log('Setting up Express...')

	const app = express()
	app.use(helmet())
	app.set('views', path.join(__dirname, 'templates'))
	app.engine('ejs', ejs.renderFile)

	app.get('/', function (req, res) {
		const appsWithManifest = apps.map(app => {
			const urlBase = `https://${req.hostname}/apps/${app.fileName}/manifest`

			return {
				...app,
				manifestUrl: `itms-services://?action=download-manifest&url=${encodeURIComponent(urlBase)}`
			}
		})

		res.render('apps.ejs', {
			host: req.hostname,
			apps: appsWithManifest
		})
	})
	
	app.get('/apps/:fileName/manifest', function (req, res) {
		const fileName = req.params.fileName
		const pkgInfo = appLookup[fileName]

		if (!pkgInfo) {
			res.sendStatus(404)
			return
		}

		res.contentType('text/xml')
		res.render('manifest.ejs', {
			host: req.hostname,
			fileName: fileName,
			pkgInfo: pkgInfo
		})
	})
	
	app.get('/apps/:fileName', function (req, res) {
		const ipaPath = path.join(__dirname, 'apps', req.params.fileName)

		if (!fs.existsSync(ipaPath)) {
			res.sendStatus(404)
			return
		}

		res.contentType('application/octet-stream ipa')
		res.sendFile(ipaPath)
	})
	
	app.use(express.static(__dirname + '/public'))

	app.listen(port, '0.0.0.0', function () {
		console.log("Server started!")
	})
}

main().catch(err => console.error(err));