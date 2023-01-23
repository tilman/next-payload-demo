import withPayload from '../../../../middleware/withPayload'
import httpStatus from 'http-status'
import NotFound from 'payload/dist/errors/NotFound'
import convertPayloadJSONBody from '../../../../middleware/convertPayloadJSONBody'
import authenticate from '../../../../middleware/authenticate'
import initializePassport from '../../../../middleware/initializePassport'
import i18n from '../../../../middleware/i18n'
import fileUpload from '../../../../middleware/fileUpload'
import withDataLoader from '../../../../middleware/dataLoader'
import getErrorHandler from 'payload/dist/express/middleware/errorHandler'
import findVersionByID from 'payload/dist/globals/operations/findVersionByID'
import { isNumber } from '../../../../utilities/isNumber'

async function handler(req, res) {
  try {
    const globalConfig = req.payload.globals.config.find(global => global.slug === req.query.global)
    const slug = req.query.global

    if (req.query.global.endsWith('_versions')) {
      switch (req.method) {
        case 'GET': {
          const result = await findVersionByID({
            globalConfig,
            id: req.query.versionID,
            depth: isNumber(req.query.depth) ? Number(req.query.depth) : undefined,
            req,
            overrideAccess: false,
            showHiddenFields: false,
          })

          return res.status(httpStatus.OK).json(result || { message: req.t('general:notFound'), value: null })
        }

        default: {
          // swallow other methods for versions
          return res.status(httpStatus.NOT_FOUND).json(new NotFound(req.t));
        }
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
