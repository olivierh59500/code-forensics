var moment     = require('moment'),
    _          = require('lodash'),
    map        = require('through2-map'),
    utils      = require('../../utils'),
    vcsSupport = require('../../vcs_support'),
    pp         = require('../../parallel_processing');

module.exports = function(context) {
  var vcsAdapter = vcsSupport.adapter(context.repository.rootPath);

  this.revisionComplexityStream = function(analyser) {
    var file = context.parameters.targetFile;
    var moduleRevisions = vcsAdapter.revisions(file, context.dateRange);

    return pp.objectStreamCollector()
    .mergeAll(utils.arrays.arrayToFnFactory(moduleRevisions, function(revisionObj) {
      return vcsAdapter.showRevisionStream(revisionObj.revisionId, file)
      .pipe(analyser.sourceAnalysisStream(file))
      .pipe(map.obj(function(analysisResult) {
        return _.extend({revision: revisionObj.revisionId, date: moment(revisionObj.date)}, analysisResult);
      }));
    }));
  };
};