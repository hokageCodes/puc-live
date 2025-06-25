'use client';

const CareersPage = () => {
  return (
    <div className="min-h-screen font-sans">
      {/* Hero Banner Section */}
      <section
        className="relative h-[40vh] md:h-[50vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/img/careers1.jpg')",
        }}
      >
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-2 pt-16 md:pt-16 space-y-12">
        {/* Introduction Section */}
        <section className="text-justify">
          <h2 className="text-3xl md:text-4xl font-bold text-[#01553d] mb-4">Interested in Joining?</h2>
          <p className="text-gray-800 mb-4 text-lg">
            At PUC, we recruit and retain legal professionals with strong academic
            backgrounds, the ability to solve complex issues, and provide sound
            legal advice to clients. We allow our lawyers to define their career
            paths within the ambit of advocacy and transactional practice, helping
            them develop specialized skills in preferred practice areas.
          </p>
          <p className="text-gray-800 mb-4 text-lg">
            Our reputation for unparalleled service delivery is attributed to
            recruiting, developing, and training persons with brilliant academic
            backgrounds and relevant skills. We value continuous learning by
            organizing in-house training sessions and sponsoring professional courses.
          </p>
          <p className="text-gray-800 text-lg">
            We invite qualified applicants to join us by applying to the Human
            Resource Manager at{" "}
            <a href="mailto:careers@paulusoro.com" className="text-[#01553d] underline font-bold">
              careers@paulusoro.com
            </a>.
          </p>
        </section>

        {/* Roles Section */}
        <section className="space-y-8">
          <div className="bg-white p-6 rounded-lg border border-[#01553d]">
            <h3 className="text-3xl md:text-4xl font-semibold text-[#01553d]">Fresh Counsel</h3>
            <ul className="list-disc ml-6 mt-4 space-y-4 text-gray-800 text-lg">
              <li>Minimum of Second Class Upper (2.1) degree from the University and Nigerian Law School</li>
              <li>0 to 2 years post-call-to-bar experience</li>
              <li>Excellent oral and written communication skills</li>
              <li>Basic knowledge of Nigerian laws</li>
              <li>Self-confidence and good IT skills</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#01553d]">
            <h3 className="text-3xl md:text-4xl font-semibold text-[#01553d]">Experienced Counsel</h3>
            <ul className="list-disc ml-6 mt-4 space-y-4 text-gray-800 text-lg">
              <li>Minimum of Second Class Upper (2.1) degree from University and Nigerian Law School</li>
              <li>3 - 5 years practice experience in a reputable law firm</li>
              <li>Excellent oral and written communication</li>
              <li>Leadership and negotiation skills</li>
              <li>Deep knowledge of Nigerian laws</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg border border-[#01553d]">
            <h3 className="text-3xl md:text-4xl font-semibold text-[#01553d]">Internship Program</h3>
            <p className="text-gray-800 mt-4 text-lg">
              We encourage law students and law graduates to participate in our internship program.
              Interns work in various practice areas, gaining practical experience to complement their theoretical knowledge.
            </p>
            <p className="text-gray-800 text-lg mt-4">
              Interested individuals should send their application letter and CV to{" "}
              <a href="mailto:careers@paulusoro.com" className="text-[#01553d] font-bold tracking-tight underline">
                careers@paulusoro.com
              </a>.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#01553d] text-white text-center py-12 px-2 rounded-lg">
          <h2 className="text-3xl md:text-4xl font-semibold">Let us Work Together</h2>
          <p className="mt-4 text-md md:text-xl max-w-xl mx-auto text-center">
            Whether you are a fresher or an experienced professional, explore PUC for
            opportunities to grow, learn, and lead.
          </p>
          <button
            className="mt-6 bg-[#fff] border text-[#01553d] font-semibold py-4 px-6 
              hover:bg-transparent hover:text-white transition duration-300 rounded-lg"
          >
            <a href="/job-openings">See Job Openings</a>
          </button>
        </section>
      </div>
    </div>
  );
};

export default CareersPage;
