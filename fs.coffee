window.FSJSON = {}
class FSJSON.FsJsonObject
  ###
  # Creates a new FsJsonObject, accepting an options hash.
  # 
  # Parameters:
  #   size: the number of bytes to request via the FileSystem API. Defaults to
  #       5 MiB
  #   fileName: The name of the file to write to. Defaults to object.json
  #   onReady: The function to call when the FileSystem API has granted the
  #       app permission for use.
  #   persistent: Whether or not to request persistent data from the API. 
  #       Defaults to persistent.
  #   errorCallback: The callback to use on errors. Defaults to a console-
  #       logging callback
  ###
  constructor: (options) ->
    options = options || {}
    options.size = if options.size? then options.size else 5 * 1024 * 1024 
    options.fileName = if options.fileName? then options.fileName else "object.json"
    options.onReady = if options.onReady? then options.onReady else ->
    options.persistent = if options.persistent then "PERSISTENT" else "TEMPORARY"
    options.errorCallback = if options.errorCallback? then options.errorCallback else @_on_error
    @_jsonObject = {}
    @options = options
    @retryRequest()

  retryRequest: ->
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
    onQuotaReady = (grantedBytes) =>
      window.requestFileSystem window[@options.persistent], grantedBytes, ((fs) =>
        @_onGranted(fs)
      ), @options.errorCallback
    if @options.persistent == "PERSISTENT"
      window.webkitStorageInfo.requestQuota window.PERSISTENT, @options.size, onQuotaReady, @options.errorCallback
    else
      onQuotaReady(@options.size)

  getObject: ->
    @_jsonObject || {}

  writeObject: (object, successCallback) ->
    if @fs?
      @_jsonObject = if object? then object else @_jsonObject
      successCallback = if successCallback? then successCallback else ->

      fileWriterHandler = (fileWriter) =>
        json_string = JSON.stringify(@_jsonObject)
        blob = new Blob([json_string])
        fileWriter.write blob
        successCallback()

      fileEntryHandler = (fileEntry) =>
        fileEntry.createWriter fileWriterHandler, @_onError

      @fs.root.getFile @options.fileName, {create: true}, (fe) =>
        fe.remove =>
          @fs.root.getFile @options.fileName, {create: true}, fileEntryHandler, @_onError
        , @_onError
      , @_onError
    else
      console.log "No filesystem space has been obtained for this object."

  readObject: (successCallback) ->
    result = {}
    fileHandler = (file) =>
      reader = new FileReader()
      reader.onloadend = (e) =>
        if JSON then @_jsonObject = JSON.parse(e.target.result) else console.log "JSON parsing not supported"
        successCallback(e)
      reader.readAsText(file)

    fileEntryHandler = (fileEntry) =>
      fileEntry.file fileHandler, @_onError

    @fs.root.getFile @options.fileName, {create: true}, fileEntryHandler, @onError

  _onGranted: (fs) ->
    @fs = fs
    @options.onReady @

  _onError: (e) ->
    switch e.code
      when FileError.QUOTA_EXCEEDED_ERR then msg = 'Local storage quota exceeded'
      when FileError.NOT_FOUND_ERR then msg = 'Local storage file not found'
      when FileError.SECURITY_ERR then msg = 'A security error occurred'
      when FileError.INVALID_MODIFICATION_ERR then msg = 'You do not have permission to save results'
      when FileError.INVALID_STATE_ERR then msg = 'Invalid state was encountered'
      else msg = 'Unknown Error'
    console.log "Error: #{msg}"
