function FAQ() {
    const faqs = [
      { q: "How do I ensure a spare part matches my vehicle?", a: "Every part in our database maps to a unique manufacturer SKU reference code. Enter your precise car chassis series or pipeline specifications into our search input bar to match compatibility rules instantly." },
      { q: "Are the mechanical catalog parts genuine?", a: "Yes. Mhenik Traders strictly stocks authenticated automotive components designed for exact structural fitment and durable field operations." },
      { q: "Where are you located and do you deliver?", a: "Our primary physical hub operations reside in Nairobi, Kenya. We arrange fast courier drop-offs and freight shipping across commercial zones." }
    ];
  
    return (
      <div class="container py-5">
        <div class="row">
          <div class="col-md-8 mx-auto">
            <h1 class="h2 text-dark fw-bold mb-4 text-center">Frequently Asked Questions</h1>
            <div class="accordion shadow-sm rounded-3 overflow-hidden" id="faqAccordion">
              {faqs.map((faq, idx) => (
                <div class="accordion-item border-0 border-bottom" key={idx}>
                  <h2 class="accordion-header">
                    <button class="accordion-button collapsed fw-bold text-dark py-3" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${idx}`}>
                      {faq.q}
                    </button>
                  </h2>
                  <div id={`#faq-${idx}`} class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body bg-light text-muted lh-base">
                      {faq.a}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  export default FAQ;