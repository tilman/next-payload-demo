import withPayload from '../../../middleware/withPayload'
import httpStatus from 'http-status'
import NotFound from 'payload/dist/errors/NotFound'
import convertPayloadJSONBody from '../../../middleware/convertPayloadJSONBody'
import authenticate from '../../../middleware/authenticate'
import initializePassport from '../../../middleware/initializePassport'
import formatSuccessResponse from 'payload/dist/express/responses/formatSuccess'
import { getTranslation } from 'payload/dist/utilities/getTranslation'
import i18n from '../../../middleware/i18n'
import fileUpload from '../../../middleware/fileUpload'
import withDataLoader from '../../../middleware/dataLoader'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import { isNumber } from '../../../utilities/isNumber'
import findVersions from 'payload/dist/collections/operations/findVersions'

async function handler(req, res) {
  try {
    if (req.query.collection.endsWith('_versions')) {
      switch (req.method) {
        case 'GET': {
          const result = await findVersions({
            collection: req.query.collection,
            depth: isNumber(req.query.depth) ? Number(req.query.depth) : undefined,
            limit: isNumber(req.query.limit) ? Number(req.query.limit) : undefined,
            overrideAccess: false,
            req,
            page: isNumber(req.query.page) ? Number(req.query.page) : undefined,
            showHiddenFields: false,
            sort: req.query.sort,
            where: req.query.where,
          })

          return res.status(httpStatus.OK).json(result || { message: req.t('general:notFound'), value: null })
        }

        default: {
          // swallow other methods for versions
          return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t));
        }
      }
    }

    switch (req.method) {
      case 'GET': {
        const result = await req.payload.find({
          req,
          collection: req.query.collection,
          where: req.query.where,
          page: isNumber(req.query.page) ? Number(req.query.page) : undefined,
          limit: isNumber(req.query.limit) ? Number(req.query.limit) : undefined,
          sort: req.query.sort,
          depth: isNumber(req.query.depth) ? Number(req.query.depth) : undefined,
          draft: req.query.draft === 'true',
          overrideAccess: false,
        })

        return res.status(200).json(result)
      }

      case 'POST': {
        const doc = await req.payload.create({
          req,
          collection: req.query.collection,
          data: req.body,
          depth: isNumber(req.query.depth) ? Number(req.query.depth) : undefined,
          draft: req.query.draft === 'true',
          overrideAccess: false,
          file: req.files && req.files.file ? req.files.file : undefined,
        })

        const collection = req.payload.collections[req.query.collection]

        return res.status(201).json({
          ...formatSuccessResponse(req.i18n.t('general:successfullyCreated', { label: getTranslation(collection.config.labels.singular, req.i18n) }), 'message'),
          doc,
        })
      }
    }
  } catch (error) {
    const errorHandler = getErrorHandler(req.payload.config, req.payload.logger)
    return errorHandler(error, req, res, () => null);
  }

  return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t))
}

export const config = {
  api: {
    bodyParser: false,
  }
}

export default withPayload(
  withDataLoader(
    fileUpload(
      convertPayloadJSONBody(
        i18n(
          initializePassport(
            authenticate(
              handler
            )
          )
        )
      )
    )
  )
)
