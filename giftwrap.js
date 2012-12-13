// Generated by CoffeeScript 1.4.0
(function() {

  window.GW = {};

  GW.Present = (function() {
    /*
      # Creates a new Present, accepting an options hash.
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
    */

    function Present(options) {
      options = options || {};
      options.size = options.size != null ? options.size : 5 * 1024 * 1024;
      options.fileName = options.fileName != null ? options.fileName : "object.json";
      options.onReady = options.onReady != null ? options.onReady : function() {};
      options.persistent = options.persistent ? "PERSISTENT" : "TEMPORARY";
      options.errorCallback = options.errorCallback != null ? options.errorCallback : this._on_error;
      this._jsonObject = {};
      this.options = options;
      this.retryRequest();
    }

    Present.prototype.retryRequest = function() {
      var onQuotaReady,
        _this = this;
      window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
      onQuotaReady = function(grantedBytes) {
        return window.requestFileSystem(window[_this.options.persistent], grantedBytes, (function(fs) {
          return _this._onGranted(fs);
        }), _this.options.errorCallback);
      };
      if (this.options.persistent === "PERSISTENT") {
        return window.webkitStorageInfo.requestQuota(window.PERSISTENT, this.options.size, onQuotaReady, this.options.errorCallback);
      } else {
        return onQuotaReady(this.options.size);
      }
    };

    Present.prototype.getObject = function() {
      return this._jsonObject || {};
    };

    Present.prototype.writeObject = function(object, successCallback) {
      var fileEntryHandler, fileWriterHandler,
        _this = this;
      if (this.fs != null) {
        this._jsonObject = object != null ? object : this._jsonObject;
        successCallback = successCallback != null ? successCallback : function() {};
        fileWriterHandler = function(fileWriter) {
          var blob, json_string;
          json_string = JSON.stringify(_this._jsonObject);
          blob = new Blob([json_string]);
          fileWriter.write(blob);
          return successCallback();
        };
        fileEntryHandler = function(fileEntry) {
          return fileEntry.createWriter(fileWriterHandler, _this._onError);
        };
        return this.fs.root.getFile(this.options.fileName, {
          create: true
        }, function(fe) {
          return fe.remove(function() {
            return _this.fs.root.getFile(_this.options.fileName, {
              create: true
            }, fileEntryHandler, _this._onError);
          }, _this._onError);
        }, this._onError);
      } else {
        return console.log("No filesystem space has been obtained for this object.");
      }
    };

    Present.prototype.readObject = function(successCallback) {
      var fileEntryHandler, fileHandler, result,
        _this = this;
      result = {};
      fileHandler = function(file) {
        var reader;
        reader = new FileReader();
        reader.onloadend = function(e) {
          if (JSON) {
            _this._jsonObject = JSON.parse(e.target.result);
          } else {
            console.log("JSON parsing not supported");
          }
          return successCallback(e);
        };
        return reader.readAsText(file);
      };
      fileEntryHandler = function(fileEntry) {
        return fileEntry.file(fileHandler, _this._onError);
      };
      return this.fs.root.getFile(this.options.fileName, {
        create: true
      }, fileEntryHandler, this.onError);
    };

    Present.prototype._onGranted = function(fs) {
      this.fs = fs;
      return this.options.onReady(this);
    };

    Present.prototype._onError = function(e) {
      var msg;
      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'Local storage quota exceeded';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'Local storage file not found';
          break;
        case FileError.SECURITY_ERR:
          msg = 'A security error occurred';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'You do not have permission to save results';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'Invalid state was encountered';
          break;
        default:
          msg = 'Unknown Error';
      }
      return console.log("Error: " + msg);
    };

    return Present;

  })();

}).call(this);