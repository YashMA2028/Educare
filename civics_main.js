var app = angular.module("educareApp", []);

app.controller("CivicsController", function ($scope) {
    // Sample chapter data for Civics
    $scope.chapters = [
        {
            id: 1,
            name: "Working of the Constitution",
            description: "This chapter explores the practical functioning of the Indian Constitution, its key features, and how it governs the world's largest democracy.",
            keyConcepts: [
                "Preamble of the Constitution",
                "Fundamental Rights and Duties",
                "Directive Principles of State Policy",
                "Separation of Powers",
                "Federal Structure"
            ],
            principles: [
                "Sovereignty, Socialism, Secularism, Democracy, Republic",
                "Justice - Social, Economic and Political",
                "Liberty of thought, expression, belief, faith and worship",
                "Equality of status and opportunity",
                "Fraternity assuring dignity of the individual"
            ],
            constitutionalProvisions: [
                { article: "14-18", description: "Right to Equality" },
                { article: "19-22", description: "Right to Freedom" },
                { article: "23-24", description: "Right against Exploitation" },
                { article: "25-28", description: "Right to Freedom of Religion" },
                { article: "29-30", description: "Cultural and Educational Rights" },
                { article: "32", description: "Right to Constitutional Remedies" }
            ],
            landmarkCases: [
                {
                    name: "Kesavananda Bharati vs State of Kerala",
                    year: 1973,
                    description: "Established the Basic Structure Doctrine limiting Parliament's power to amend the Constitution"
                },
                {
                    name: "Maneka Gandhi vs Union of India",
                    year: 1978,
                    description: "Expanded the interpretation of Article 21 (Right to Life and Personal Liberty)"
                }
            ],
            amendments: [
                {
                    number: "42nd",
                    year: 1976,
                    description: "Added Fundamental Duties to the Constitution during the Emergency"
                },
                {
                    number: "44th",
                    year: 1978,
                    description: "Restored some judicial powers and made several other important changes"
                },
                {
                    number: "73rd & 74th",
                    year: 1992,
                    description: "Constitutionalized the Panchayati Raj and Municipalities (Local Self-Government)"
                }
            ]
        },
        {
            id: 2,
            name: "The Electoral Process",
            description: "This chapter examines India's electoral system, the role of the Election Commission, and the importance of free and fair elections in a democracy.",
            keyConcepts: [
                "Universal Adult Franchise",
                "Election Commission of India",
                "Electoral Reforms",
                "Voting Systems",
                "Political Parties and Elections"
            ],
            principles: [
                "Free and Fair Elections",
                "Secret Ballot System",
                "One Person One Vote One Value",
                "Independent Election Commission",
                "Code of Conduct for Elections"
            ],
            constitutionalProvisions: [
                { article: "324", description: "Superintendence, direction and control of elections vested in Election Commission" },
                { article: "325", description: "No person to be ineligible for inclusion in electoral rolls on grounds of religion, race, caste or sex" },
                { article: "326", description: "Elections to the House of the People and State Assemblies to be on basis of adult suffrage" }
            ],
            landmarkCases: [
                {
                    name: "Indira Gandhi vs Raj Narain",
                    year: 1975,
                    description: "Case that led to the imposition of Emergency and subsequent electoral reforms"
                }
            ],
            amendments: [
                {
                    number: "61st",
                    year: 1989,
                    description: "Reduced voting age from 21 to 18 years"
                }
            ]
        }
    ];
    
    // Initialize variables
    $scope.selectedChapterId = null;
    $scope.isPlaying = false;
    $scope.voices = [];
    $scope.selectedVoice = null;
    $scope.speechRate = 1;
    
    // Load available voices
    $scope.loadVoices = function() {
        $scope.voices = window.speechSynthesis.getVoices();
        // Try to find a natural-sounding English voice
        $scope.selectedVoice = $scope.voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Natural')
        ) || $scope.voices.find(voice => voice.lang.includes('en'));
    };
    
    // Voice loading can be asynchronous
    window.speechSynthesis.onvoiceschanged = $scope.loadVoices;
    $scope.loadVoices(); // Initial load
    
    // Toggle chapter visibility
    $scope.toggleChapter = function(chapterId) {
        if ($scope.selectedChapterId === chapterId) {
            $scope.selectedChapterId = null;
            window.speechSynthesis.cancel();
            $scope.isPlaying = false;
        } else {
            $scope.selectedChapterId = chapterId;
        }
    };
    
    // Change voice for speech synthesis
    $scope.changeVoice = function() {
        if ($scope.isPlaying) {
            $scope.toggleAudio(); // Stop current speech
            $scope.toggleAudio(); // Restart with new voice
        }
    };
    
    // Text-to-speech functionality
    $scope.toggleAudio = function() {
        if ($scope.isPlaying) {
            window.speechSynthesis.cancel();
            $scope.isPlaying = false;
        } else {
            $scope.readCurrentContent();
        }
    };
    
    // Read the current chapter content
    $scope.readCurrentContent = function() {
        if (!$scope.selectedChapterId) return;
        
        const chapter = $scope.chapters.find(c => c.id === $scope.selectedChapterId);
        if (!chapter) return;
        
        let textToRead = `Chapter ${chapter.id}: ${chapter.name}. ${chapter.description}. `;
        
        // Add key concepts
        textToRead += "Key Concepts: " + chapter.keyConcepts.join('. ') + '. ';
        
        // Add principles
        textToRead += "Important Principles: " + chapter.principles.join('. ') + '. ';
        
        // Add constitutional provisions
        textToRead += "Constitutional Provisions: ";
        chapter.constitutionalProvisions.forEach(prov => {
            textToRead += `Article ${prov.article}: ${prov.description}. `;
        });
        
        // Add landmark cases
        textToRead += "Landmark Cases: ";
        chapter.landmarkCases.forEach(caseItem => {
            textToRead += `${caseItem.name} in ${caseItem.year}: ${caseItem.description}. `;
        });
        
        // Add amendments
        textToRead += "Important Amendments: ";
        chapter.amendments.forEach(amend => {
            textToRead += `${amend.number} Amendment in ${amend.year}: ${amend.description}. `;
        });
        
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.rate = $scope.speechRate;
        
        if ($scope.selectedVoice) {
            utterance.voice = $scope.selectedVoice;
        }
        
        utterance.onend = function() {
            $scope.isPlaying = false;
            $scope.$apply();
        };
        
        utterance.onerror = function(event) {
            console.error("SpeechSynthesis error:", event);
            $scope.isPlaying = false;
            $scope.$apply();
        };
        
        window.speechSynthesis.speak(utterance);
        $scope.isPlaying = true;
    };
    
    // Read specific text
    $scope.readText = function(text, event) {
        if (event) event.stopPropagation();
        
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = $scope.speechRate;
        
        if ($scope.selectedVoice) {
            utterance.voice = $scope.selectedVoice;
        }
        
        window.speechSynthesis.speak(utterance);
    };
    
    // Keyboard event handler
    $scope.handleKeyPress = function(event) {
        if (event.keyCode === 32) { // Spacebar
            event.preventDefault();
            $scope.toggleAudio();
        }
    };
});