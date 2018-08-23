var lectures = {
    'IMT4110': [
      {
        id: 1,
        course: 'IMT4110',
        date: '23.08.18',
        notes: '# Introduction to Scientific Methodology and Communication\n## Lecture 1',
        title: '# Introduction to Scientific Methodology and Communication',
        preview: '## Lecture 1 ...'//notes.substring(0,10)
      },
      {
        id: 2,
        course: 'IMT4110',
        date: '27.08.18',
        notes: '# Writing a Scientific Paper\n## Lecture 2',
        title: '# Writing a Scientific Paper',
        preview: '## Lecture 2 ...'//notes.substring(0,10)
      },
    ],
    'IMT4114': [
      {
        id: 1,
        course: 'IMT4114',
        date: '20.08.18',
        notes: '# Introduction to Cyber and Information Security Technology\n## Lecture 1',
        title: '# Introduction to Cyber and Information Security Technology',
        preview: '## Lecture 1 ...'
      },
      {
        id: 2,
        course: 'IMT4114',
        date: '23.08.18',
        notes: '# Chapter 1: Cryptography\n## Lecture 2',
        title: '# Chapter 1: Cryptography',
        preview: 'Lecture 2 ...'
      }
    ],
  }
  var courses = [
    {
      id: '1', course: 'IMT4110',
      lectures: lectures.IMT4110
    },
    {
      id: '2', course: 'IMT4114',
      lectures: lectures.IMT4114
    }
  ];

  module.exports = courses;