function About() {
    return (
      <div class="container py-5">
        <div class="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3">
          <h1 class="h2 text-dark fw-bold border-bottom border-warning border-3 pb-2 mb-4">About Mhenik Traders</h1>
          <p class="text-muted fs-5 lh-base">
            Established as a premier automotive mechanical component distribution partner in Nairobi, Kenya, <strong>Mhenik Traders</strong> serves fleet operators, mechanical workshops, and individual motorists nationwide.
          </p>
          <p class="text-muted fs-5 lh-base mb-4">
            Our core operation revolves around high-accuracy inventory cross-matching. By indexing over 3,700 unique components by precision engineering SKUs and manufacturer codes, we eliminate cross-compatibility sorting errors, keeping mechanical downtime to a strict minimum.
          </p>
          <div class="row g-4 mt-2">
            <div class="col-sm-6">
              <div class="p-3 bg-light rounded border border-start-0">
                <h6 class="fw-bold text-primary">Genuine Import Verification</h6>
                <p class="small text-muted mb-0">Every replacement pipeline component or system kit maps straight to trusted manufacturing references.</p>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="p-3 bg-light rounded border border-start-0">
                <h6 class="fw-bold text-primary">Nairobi Supply Operations</h6>
                <p class="small text-muted mb-0">Centralized storage guarantees prompt order assembly routing directly to dispatch hubs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default About;