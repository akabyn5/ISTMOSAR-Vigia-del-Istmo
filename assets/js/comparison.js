(function () {
  "use strict";
  // Deliberately no comparison renderer in the initial release.
  // Pairwise products stay unpublished until the AOI, footprints, QA policy,
  // common-valid mask, and scientific acceptance criteria are approved.
  window.istmosarComparison = Object.freeze({
    enabled: false,
    status: "pending-scientific-approval"
  });
})();
