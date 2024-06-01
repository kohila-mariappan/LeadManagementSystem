const successResponse = (res, msg) => {
    const data = {
      status: 200,
      message: msg
    }
    return res.status(200).json(data)
  }
  const successResponseWithData = (res, msg, data) => {
    const datas = {
      status: 200,
      message: msg || '',
      data
    }
    res.status(200).json(datas)
  }
  const successResponseForCreation = (res, msg) => {
    const datas = {
      status: 201,
      message: msg || '',
      
    }
    res.status(201).json(datas)
  }
  const errorResponse = (res, msg) => {
    const data = {
      status: 500,
      message: msg
    }
    return res.status(500).json(data)
  }
  const notFoundResponse = (res, msg) => {
    const data = {
      status: 404,
      message: msg
    }
    return res.status(404).json(data)
  }
  const authorisationErrorReponse = (res, msg) => {
    const data = {
      status: 401,
      message: msg
    }
    return res.status(401).json(data)
  }
  const badRequestResponse = (res, msg) => {
    const data = {
      status: 400,
      message: msg
    }
    return res.status(400).json(data)
  }
  const dataResponse = (res, msg) => {
    const data = {
      status: 409,
      message: msg
    }
    return res.status(409).json(data)
  }
  
  module.exports = {
    successResponse,
    successResponseWithData,
    errorResponse,
    notFoundResponse,
    authorisationErrorReponse,
    badRequestResponse,
    dataResponse,
    successResponseForCreation
  }